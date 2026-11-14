import { createApp, ref, onMounted, h } from 'vue'
import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'

// SVG eye icon (visible)
const IconEye = () => h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '18', height: '18',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    style: 'display:block;',
    'aria-hidden': 'true',
}, [
    h('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
    h('circle', { cx: '12', cy: '12', r: '3' }),
])

// SVG eye-off icon (hidden)
const IconEyeOff = () => h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '18', height: '18',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    style: 'display:block;',
    'aria-hidden': 'true',
}, [
    h('path', { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94' }),
    h('path', { d: 'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19' }),
    h('line', { x1: '1', y1: '1', x2: '23', y2: '23' }),
])

const App = {
    setup() {
        const apiKey = ref('')
        const saving = ref(false)
        const status = ref('')
        const statusType = ref('') // 'success' | 'error' | ''
        const showKey = ref(false)
        const inputFocused = ref(false)

        onMounted(async () => {
            try {
                const res = await axios.get(generateUrl('/apps/cloudconvert_nc_app/admin/settings'))
                apiKey.value = res.data.api_key || ''
            } catch (e) {
                status.value = 'Failed to load settings.'
                statusType.value = 'error'
            }
        })

        async function save() {
            saving.value = true
            status.value = ''
            statusType.value = ''
            try {
                await axios.post(generateUrl('/apps/cloudconvert_nc_app/admin/settings'), { api_key: apiKey.value })
                status.value = 'API key saved successfully.'
                statusType.value = 'success'
            } catch (e) {
                status.value = 'Failed to save: ' + (e.response?.data?.message || e.message)
                statusType.value = 'error'
            } finally {
                saving.value = false
            }
        }

        return () => {
            const borderColor = inputFocused.value ? '#0082c9' : '#dbdbdb'
            const inputBoxShadow = inputFocused.value ? '0 0 0 2px rgba(0,130,201,0.2)' : 'none'

            return h('div', { style: 'padding: 24px 24px 24px 30px; font-family: system-ui, -apple-system, sans-serif;' }, [

                // Header row with icon
                h('div', { style: 'display:flex; align-items:center; gap:10px; margin-bottom:6px;' }, [
                    h('span', {
                        style: 'display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:#0082c9; border-radius:8px; flex-shrink:0;',
                    }, [
                        h('svg', {
                            xmlns: 'http://www.w3.org/2000/svg',
                            width: '18', height: '18',
                            viewBox: '0 0 24 24',
                            fill: 'none',
                            stroke: '#fff',
                            'stroke-width': '2',
                            'stroke-linecap': 'round',
                            'stroke-linejoin': 'round',
                        }, [
                            h('rect', { x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }),
                            h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }),
                        ]),
                    ]),
                    h('h2', { style: 'font-size:17px; font-weight:600; color:#222; margin:0;' }, 'CloudConvert API Settings'),
                ]),

                // Description
                h('p', { style: 'margin:8px 0 20px 0; color:#6b7280; font-size:13.5px; line-height:1.5;' }, [
                    'Enter your CloudConvert API key to enable file conversion. Get one from ',
                    h('a', {
                        href: 'https://cloudconvert.com/dashboard/api/v2/keys',
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        style: 'color:#0082c9; text-decoration:none; font-weight:500;',
                    }, 'cloudconvert.com/dashboard'),
                    '.',
                ]),

                // Card — full width
                h('div', {
                    style: [
                        'background:#fff;',
                        'border:1px solid #e5e7eb;',
                        'border-radius:10px;',
                        'padding:20px 24px;',
                        'box-shadow:0 1px 4px rgba(0,0,0,.06);',
                    ].join(''),
                }, [

                    // Label
                    h('label', {
                        for: 'cc-api-key',
                        style: 'display:block; font-size:13px; font-weight:600; color:#374151; margin-bottom:8px; letter-spacing:.01em;',
                    }, 'API Key'),

                    // Input wrapper — full width with eye button inside
                    h('div', {
                        style: [
                            'display:flex; align-items:center; width:100%;',
                            `border:1.5px solid ${borderColor};`,
                            'border-radius:7px;',
                            `box-shadow:${inputBoxShadow};`,
                            'background:#fff;',
                            'overflow:hidden;',
                            'transition:border-color .15s, box-shadow .15s;',
                        ].join(''),
                    }, [
                        h('input', {
                            id: 'cc-api-key',
                            type: showKey.value ? 'text' : 'password',
                            value: apiKey.value,
                            onInput: e => { apiKey.value = e.target.value },
                            onKeydown: e => { if (e.key === 'Enter') save() },
                            onFocus: () => { inputFocused.value = true },
                            onBlur: () => { inputFocused.value = false },
                            placeholder: 'eyJ0eXAiOiJKV1QiLCJhbGci…',
                            autocomplete: 'off',
                            spellcheck: false,
                            style: [
                                'flex:1; border:none; outline:none;',
                                'padding:10px 12px;',
                                'font-size:13px; font-family:ui-monospace, monospace;',
                                'color:#111; background:transparent;',
                                'min-width:0; width:100%;',
                            ].join(''),
                        }),

                        // Eye toggle button
                        h('button', {
                            type: 'button',
                            onClick: () => { showKey.value = !showKey.value },
                            title: showKey.value ? 'Hide key' : 'Show key',
                            style: [
                                'display:flex; align-items:center; justify-content:center;',
                                'padding:0 12px; height:100%; min-height:40px;',
                                'border:none; background:transparent; cursor:pointer;',
                                'color:#9ca3af; flex-shrink:0;',
                                'transition:color .15s;',
                            ].join(''),
                            onMouseenter: e => { e.currentTarget.style.color = '#0082c9' },
                            onMouseleave: e => { e.currentTarget.style.color = '#9ca3af' },
                        }, [
                            showKey.value ? h(IconEyeOff) : h(IconEye),
                        ]),
                    ]),

                    // Save button — below the input
                    h('div', { style: 'margin-top:14px;' }, [
                        h('button', {
                            type: 'button',
                            onClick: save,
                            disabled: saving.value,
                            style: [
                                'padding:9px 28px;',
                                `background:${saving.value ? '#7eb8df' : '#0082c9'};`,
                                'color:#fff; border:none; border-radius:7px;',
                                'font-size:13.5px; font-weight:600;',
                                `cursor:${saving.value ? 'not-allowed' : 'pointer'};`,
                                'letter-spacing:.01em;',
                                'transition:background .15s;',
                                'display:inline-flex; align-items:center; gap:6px;',
                            ].join(''),
                            onMouseenter: e => { if (!saving.value) e.currentTarget.style.background = '#006aa3' },
                            onMouseleave: e => { if (!saving.value) e.currentTarget.style.background = '#0082c9' },
                        }, saving.value
                            ? [
                                h('span', {
                                    style: [
                                        'display:inline-block; width:13px; height:13px;',
                                        'border:2px solid rgba(255,255,255,.4);',
                                        'border-top-color:#fff; border-radius:50%;',
                                        'animation:cc-spin .7s linear infinite;',
                                    ].join(''),
                                }),
                                'Saving…',
                              ]
                            : 'Save'
                        ),
                    ]),

                    // Status message
                    status.value ? h('div', {
                        style: [
                            'display:flex; align-items:center; gap:7px;',
                            'margin-top:14px; padding:9px 13px;',
                            'border-radius:7px; font-size:13px;',
                            statusType.value === 'success'
                                ? 'background:#f0fdf4; border:1px solid #86efac; color:#166534;'
                                : 'background:#fef2f2; border:1px solid #fca5a5; color:#991b1b;',
                        ].join(''),
                    }, [
                        h('span', { style: 'font-size:15px; line-height:1;' },
                            statusType.value === 'success' ? '✓' : '✕'),
                        status.value,
                    ]) : null,
                ]),

                // Spinner keyframe style injection
                h('style', {}, `
                    @keyframes cc-spin { to { transform: rotate(360deg); } }
                `),
            ])
        }
    },
}

document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('ccconvert-admin-settings')
    if (el) {
        createApp(App).mount(el)
    }
})
