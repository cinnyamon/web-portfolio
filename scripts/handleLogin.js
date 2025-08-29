export const handlePOSTtoBackend = () => {
  const form = document.querySelector(".loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.querySelector(".uname").value;
    const password = document.querySelector(".pw").value;

    try {
      await fetch("http://127.0.0.1:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      // No need to wait for or process the response
      console.log("Login data sent.");
    } catch (err) {
      console.error("Login request failed:", err);
    }
  });
};
