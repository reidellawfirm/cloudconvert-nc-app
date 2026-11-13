import { registerFileAction } from '@nextcloud/files'
import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

registerFileAction({
    id: 'cloudconvert_nc_app',
    displayName: () => 'Convert with CloudConvert',
    iconSvgInline: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93M11 17H9V7h2zm4 0h-2V7h2z"/>
    </svg>`,
    enabled: (context) => context.nodes.length === 1,

    async exec(context) {
        const node = context.nodes[0]
        const filePath = node.path
        const fileName = node.basename
        const ext = fileName.split('.').pop().toLowerCase()

        const formatMap = {
            pdf:  ['docx', 'odt', 'txt', 'html', 'png', 'jpg'],
            docx: ['pdf', 'odt', 'txt', 'html', 'rtf'],
            doc:  ['pdf', 'odt', 'txt', 'html', 'rtf'],
            odt:  ['pdf', 'docx', 'txt', 'rtf'],
            png:  ['jpg', 'pdf', 'webp', 'gif'],
            jpg:  ['png', 'pdf', 'webp', 'gif'],
            jpeg: ['png', 'pdf', 'webp', 'gif'],
            mp4:  ['mp3', 'avi', 'mov', 'webm'],
            mov:  ['mp4', 'mp3', 'avi'],
        }
        const formats = formatMap[ext] || ['pdf', 'docx', 'png', 'jpg']

        // Build modal overlay
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;'

        const modal = document.createElement('div')
        modal.style.cssText = 'background:#fff;border-radius:12px;padding:32px;max-width:460px;width:90%;font-family:var(--font-face,sans-serif);box-shadow:0 8px 32px rgba(0,0,0,.2);'
        modal.innerHTML = `
            <h2 style="margin:0 0 6px;font-size:18px;font-weight:600;">Convert with CloudConvert</h2>
            <p style="margin:0 0 20px;color:#666;font-size:13px;">📄 ${escapeHtml(fileName)}</p>
            <p style="margin:0 0 10px;font-size:14px;font-weight:500;">Select output format:</p>
            <div id="cc-fmts" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;">
                ${formats.map(f => `<button data-fmt="${f}" style="padding:7px 14px;border:2px solid #e0e0e0;border-radius:8px;background:#fff;cursor:pointer;font-size:13px;font-weight:500;text-transform:uppercase;transition:all .15s">${f}</button>`).join('')}
            </div>
            <div style="display:flex;gap:10px;">
                <button id="cc-cancel" style="flex:1;padding:11px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer;font-size:14px;">Cancel</button>
                <button id="cc-go" style="flex:2;padding:11px;border:none;border-radius:8px;background:#0082c9;color:#fff;cursor:pointer;font-size:14px;font-weight:600;opacity:.5;" disabled>Select a format</button>
            </div>
            <p id="cc-status" style="margin:14px 0 0;text-align:center;font-size:13px;color:#555;min-height:18px;"></p>
        `

        overlay.appendChild(modal)
        document.body.appendChild(overlay)

        let selectedFormat = null

        modal.querySelectorAll('[data-fmt]').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('[data-fmt]').forEach(b => {
                    b.style.background = '#fff'
                    b.style.borderColor = '#e0e0e0'
                    b.style.color = '#000'
                })
                btn.style.background = '#0082c9'
                btn.style.borderColor = '#0082c9'
                btn.style.color = '#fff'
                selectedFormat = btn.dataset.fmt
                const goBtn = document.getElementById('cc-go')
                goBtn.disabled = false
                goBtn.style.opacity = '1'
                goBtn.textContent = `Convert to ${selectedFormat.toUpperCase()}`
            })
        })

        document.getElementById('cc-cancel').addEventListener('click', () => {
            document.body.removeChild(overlay)
        })

        document.getElementById('cc-go').addEventListener('click', async () => {
            if (!selectedFormat) return
            const status = document.getElementById('cc-status')
            const goBtn = document.getElementById('cc-go')
            status.textContent = '⏳ Converting… please wait'
            goBtn.disabled = true
            goBtn.style.opacity = '.5'

            try {
                const response = await axios.post(generateUrl('/apps/cloudconvert_nc_app/convert'), {
                    filePath,
                    outputFormat: selectedFormat,
                })
                if (response.data.success) {
                    status.textContent = '✅ Done! Saved as: ' + response.data.newFile
                    status.style.color = '#2d7d46'
                    setTimeout(() => {
                        document.body.removeChild(overlay)
                        window.location.reload()
                    }, 2000)
                } else {
                    status.textContent = '❌ ' + (response.data.error || 'Unknown error')
                    status.style.color = '#c0392b'
                    goBtn.disabled = false
                    goBtn.style.opacity = '1'
                }
            } catch (e) {
                status.textContent = '❌ ' + (e.response?.data?.error || e.message)
                status.style.color = '#c0392b'
                goBtn.disabled = false
                goBtn.style.opacity = '1'
            }
        })

        return null
    },
})
