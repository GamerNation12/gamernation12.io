document.addEventListener("DOMContentLoaded", function() {
  // Element declarations (ensure these IDs exist in your HTML)
  const trackName = document.getElementById("trackName");
  const trackArtist = document.getElementById("trackArtist");
  const trackLink = document.getElementById("trackLink");
  const trackProgress = document.getElementById("trackProgress");
  const discordName = document.getElementById("discordName");
  const discordMotd = document.getElementById("discordMotd");
  const avatarLink = document.getElementById("avatarLink");
  const discordAvatar = document.getElementById("discordAvatar");
  const statusCircle = document.getElementById("statusCircle");

  // Elements for time display:
  const timeElapsed = document.getElementById("timeElapsed");
  const timeDuration = document.getElementById("timeDuration");

  const discordID = '759433582107426816';
  let startTime, endTime, duration; // For Lanyard Spotify timestamps

  // Format time (mm:ss)
  function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor(ms / 1000 / 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Fetch data from Lanyard API (for Discord and Spotify metadata)
  function updateData() {
    fetch(`https://api.lanyard.rest/v1/users/${discordID}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Lanyard response:", data);
        const e = data; // using shorthand

        // Update Discord info
        if (e.data && e.data["discord_user"]) {
          discordName.innerText = `@${e.data.discord_user.username}`;
          avatarLink.href = `https://discord.com/users/${discordID}`;
          if (discordAvatar) {
            discordAvatar.src = `https://cdn.discordapp.com/avatars/${discordID}/${e.data["discord_user"].avatar}.png?size=4096`;
          }
          if (statusCircle) {
            let status = e.data.discord_status;
            statusCircle.style.backgroundColor =
              status === "online" ? "#23a55a" :
              status === "idle" ? "#f0b232" :
              status === "dnd" ? "#f23f43" : "#80848e";
          }
          const customStatus = (e.data.activities || []).find(activity => activity.type === 4);
          discordMotd.innerText = customStatus && customStatus.state
            ? customStatus.state
            : e.data.discord_user.bio || "No status message";
        }

        // Update Spotify metadata if listening (used for song info & progress)
        if (e.data && e.data["listening_to_spotify"]) {
          trackName.innerText = e.data.spotify.song;
          trackArtist.innerText = e.data.spotify.artist.replaceAll(";", ",");
          document.getElementById("trackImg").src = e.data.spotify.album_art_url;
          trackLink.href = `https://open.spotify.com/track/${e.data.spotify.track_id}`;

          // Save timestamps for progress calculation:
          const rawStart = e.data.spotify.timestamps.start;
          const rawEnd = e.data.spotify.timestamps.end;
          startTime = rawStart < 1e11 ? rawStart * 1000 : rawStart;  // Convert to ms if needed
          endTime = rawEnd < 1e11 ? rawEnd * 1000 : rawEnd;
          duration = endTime - startTime;
        } else {
          // Reset progress if not listening
          startTime = endTime = duration = null;
          trackProgress.style.width = "0%";
          if (timeElapsed) timeElapsed.textContent = "0:00";
          if (timeDuration) timeDuration.textContent = "0:00";
        }
      })
      .catch((error) => {
        console.error("Error fetching Lanyard data:", error);
      });
  }

  // Animate the progress bar using Lanyard's Spotify timestamps
  function animateLanyardProgress() {
    if (startTime && endTime && duration) {
      const currentTime = Date.now();
      let elapsed = currentTime - startTime;
      if (elapsed > duration) {
        elapsed = duration;
      }
      const progressPercent = (elapsed / duration) * 100;
      trackProgress.style.width = `${progressPercent}%`;
      if (timeElapsed) timeElapsed.textContent = formatTime(elapsed);
      if (timeDuration) timeDuration.textContent = formatTime(duration);
    }
    requestAnimationFrame(animateLanyardProgress);
  }

  // Initialize: Fetch metadata and update progress periodically using Lanyard
  updateData();
  setInterval(updateData, 1000); // Refresh Lanyard metadata every second
  requestAnimationFrame(animateLanyardProgress);

  // Age calculation function (for additional functionality)
  function calculateAge(birthDate) {
    const today = new Date();
    const parts = birthDate.split(".");
    const birthDay = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10);
    const birthYear = parseInt(parts[2], 10);
    let ageYears = today.getFullYear() - birthYear;
    const ageMonths = today.getMonth() + 1 - birthMonth;
    const ageDays = today.getDate() - birthDay;
    if (ageMonths < 0 || (ageMonths === 0 && ageDays < 0)) {
      ageYears--;
    }
    return ageYears;
  }

  // Update age on window load
  window.addEventListener('load', function() {
    const birthDate = "27.7.232323";
    const age = calculateAge(birthDate);
    const ageElement = document.getElementById("age");
    if (ageElement) {
      ageElement.textContent = age;
    }
  });

  // Gradient for nameNeksio background
  const gradients = [
    "#004ef7, #0084ff",
    "#ff8400, #ffc900",
    "#660acf, #ac00cf",
  ];
  const chosenGradient = gradients[Math.floor(Math.random() * gradients.length)];
  const nameNeksio = document.getElementById("nameNeksio");
  if (nameNeksio) {
    nameNeksio.style.backgroundImage = `linear-gradient(to right, ${chosenGradient})`;
  }
});