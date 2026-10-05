document.addEventListener("DOMContentLoaded", () => {
  const keySpans = document.querySelectorAll(".pastearea p span");
  let selectedFormat = "image/png";
  const statusEl = document.querySelector("h1.hidden");

  // Format selection buttons
  document.querySelectorAll(".format button").forEach((button) => {
    button.addEventListener("click", (e) => {
      document
        .querySelectorAll(".format button")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      selectedFormat = e.target.dataset.format;
    });
  });

  async function processUrl(url) {
    statusEl.style.display = "block";
    statusEl.innerHTML = "Downloading...";

    try {
      const proxyUrl =
        "https://api.allorigins.win/raw?url=" +
        encodeURIComponent(url);

      const response = await fetch(proxyUrl);

      if (!response.ok) throw new Error("Proxy request failed");

      const blob = await response.blob();

      if (!blob.type.startsWith("image/")) {
        throw new Error("URL did not return an image");
      }

      const input = document.getElementById("filename-input");

      if (!input.value.trim()) {
        try {
          const urlObj = new URL(url);
          let name = urlObj.pathname.split("/").pop();

          if (name) {
            name = decodeURIComponent(name);
            name = name.replace(/\.[^/.]+$/, "");
            input.value = name;
          }
        } catch(e) {
          console.error("Failed to parse filename from URL", e);
        }
      }
      
      await convertAndDownload(blob);
      statusEl.innerHTML = "Success!";
    } catch (err) {
      console.error(err);
      statusEl.innerHTML = "Failed download";
      window.open(url, "_blank");
    }
    
    setTimeout(() => {
      statusEl.style.display = "none";
    }, 3000);
  }

  document.addEventListener("paste", async (event) => {
    animateKeycaps();

    const items = (event.clipboardData || window.clipboardData)?.items;
    if (!items) return;

    let imageHandled = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();

        if (file) {
          statusEl.style.display = "block";
          statusEl.innerHTML = "Downloading...";
          await convertAndDownload(file);
          statusEl.innerHTML = "Success!";
          setTimeout(() => {
            statusEl.style.display = "none";
          }, 3000);
          
          imageHandled = true;
          break;
        }
      }
    }

    if (!imageHandled) {
      const pastedText = event.clipboardData.getData("text")?.trim();

      if (pastedText && /^https?:\/\//i.test(pastedText)) {
        await processUrl(pastedText);
      }
    }
  });

  const urlInput = document.querySelector(".textpaste input");
  urlInput.addEventListener("keydown", async (e) => {
    if (e.key === 'Enter') {
      const url = urlInput.value.trim();
      if (/^https?:\/\//i.test(url)) {
        await processUrl(url);
      }
    }
  });

  async function convertAndDownload(blobOrFile) {
    const objectUrl = URL.createObjectURL(blobOrFile);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      // Fill background with white if converting transparency to JPG
      if (selectedFormat === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL(selectedFormat, 0.92);

      let ext = "png";
      if (selectedFormat === "image/jpeg") ext = "jpg";
      if (selectedFormat === "image/webp") ext = "webp";

      const input = document.getElementById("filename-input");
      const customName = input.value.trim().replace(/[<>:"/\\|?*]/g, "");
      const filename = `${customName || `pasted-image-${Date.now()}`}.${ext}`;

      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      // Fallback to direct trigger if image loading fails
      const ext = selectedFormat.split("/")[1] || "png";
      triggerDownload(blobOrFile, `pasted-image-${Date.now()}.${ext}`);
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  }

  function triggerDownload(blobOrFile, filename) {
    const objectUrl = URL.createObjectURL(blobOrFile);
    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();

    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  function animateKeycaps() {
    keySpans.forEach((span) => {
      span.style.transform = "translateY(3px)";
      span.style.borderBottomWidth = "1px";
    });

    setTimeout(() => {
      keySpans.forEach((span) => {
        span.style.transform = "";
        span.style.borderBottomWidth = "";
      });
    }, 150);
  }
});
