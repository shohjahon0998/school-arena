
async function loadStatus() {
  try {
    const response = await fetch("/api/status");
    const data = await response.json();

    console.log("SCHOOL ARENA:", data);
  } catch (error) {
    console.error("Server bilan aloqa yo'q");
  }
}

loadStatus();
