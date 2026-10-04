document.addEventListener("DOMContentLoaded", () => {
  const keySpans = document.querySelectorAll(".pastearea p span");
  let selectedFormat = "image/png";

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
          await convertAndDownload(file);
          imageHandled = true;
          break;
        }
      }
    }

    if (!imageHandled) {
      const pastedText = event.clipboardData.getData("text")?.trim();

      if (pastedText && /^https?:\/\//i.test(pastedText)) {
        try {
          const proxyUrl =
            "https://api.allorigins.win/raw?url=" +
            encodeURIComponent(pastedText);

          const response = await fetch(proxyUrl);

          if (!response.ok) throw new Error("Proxy request failed");

          const blob = await response.blob();

          if (!blob.type.startsWith("image/")) {
            throw new Error("URL did not return an image");
          }

          const input = document.getElementById("filename-input");

          if (!input.value.trim()) {
            const url = new URL(pastedText);
            let name = url.pathname.split("/").pop();

            if (name) {
              name = decodeURIComponent(name);
              name = name.replace(/\.[^/.]+$/, "");
              input.value = name;
            }
          }
          document.querySelector("h1.hidden").style.display = "block";
          await convertAndDownload(blob);
        } catch (err) {
          console.error(err);
          document.querySelector("h1.hidden").innerHTML = "Failed download";
          window.open(pastedText, "_blank");
        }
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

  function isImageUrl(url) {
    return (
      /^https?:\/\/.*\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(url) ||
      /^data:image\/(png|jpeg|webp|gif);base64,/i.test(url)
    );
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
