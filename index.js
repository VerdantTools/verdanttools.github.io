document.addEventListener('DOMContentLoaded', () => {
    const keySpans = document.querySelectorAll('.pastearea p span');
    
    document.addEventListener('paste', async (event)=> {
        animateKeycaps();

        const items = (event.clipboardData || window.clipboardData)?.items;
        if (!items) return;

        let imageHandled = false;
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();

                if (file) {
                    const ext = item.type.split('/')[1] || 'png';
                    const filename = `pasted-image-${Date.now()}.${ext}`;

                    triggerDownload(file, filename);
                    imageHandled = true;
                    break;
                }
            }
        }

        if (!imageHandled) {
            const pastedText = event.clipboardData.getData('text')?.trim();
            
            if (pastedText && isImageUrl(pastedText)) {
                try {
                    const response = await fetch(pastedText);
                    const blob = await response.blob();
                    const ext = blob.type.split('/')[1] || 'jpg';
                    const filename = `downloaded-image-${Date.now()}.${ext}`;

                    triggerDownload(blob, filename);
                } catch (err) {
                    window.open(pastedText, '_blank');
                }
            }
        }
    });

    function isImageUrl(url) {
        return /^https?:\/\/.*\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(url) ||
               /^data:image\/(png|jpeg|webp|gif);base64,/i.test(url);
    }

    function triggerDownload(blobOrFile, filename) {
        const objectUrl = URL.createObjectURL(blobOrFile);
        const anchor = document.createElement('a');

        anchor.href = objectUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();

        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }

    function animateKeycaps() {
        keySpans.forEach(span => {
            span.style.transform = 'translateY(3px)';
            span.style.borderBottomWidth = '1px';
        });

        setTimeout(() => {
            keySpans.forEach(span => {
                span.style.transform = '';
                span.style.borderBottomWidth = '';
            });
        }, 150);
    }
});