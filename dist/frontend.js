const PRISM_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M12 2.8 21 19H3L12 2.8Z" stroke="currentColor" stroke-width="1.65"/><path d="M12 2.8V19M3 19l9-6.2 9 6.2" stroke="currentColor" stroke-width="1.35"/><path d="m8.2 15.4 3.8 3.6 4-3.7" stroke="currentColor" stroke-width="1.25"/></svg>`;
const GEAR_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M9.7 3.5h4.6l.5 2c.5.2.9.4 1.3.7l2-.6 2.3 4-1.5 1.5c0 .3.1.6.1.9s0 .6-.1.9l1.5 1.5-2.3 4-2-.6c-.4.3-.8.5-1.3.7l-.5 2H9.7l-.5-2a7 7 0 0 1-1.3-.7l-2 .6-2.3-4 1.5-1.5A6 6 0 0 1 5 12c0-.3 0-.6.1-.9L3.6 9.6l2.3-4 2 .6c.4-.3.8-.5 1.3-.7l.5-2Z" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.4"/></svg>`;
const SPARK_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M12 3.5c.6 4.8 3.1 7.3 7.8 8-4.7.7-7.2 3.2-7.8 8-.7-4.8-3.2-7.3-7.8-8 4.6-.7 7.1-3.2 7.8-8Z" stroke="currentColor" stroke-width="1.55"/></svg>`;
const CSS = `
.ldc-shell,.ldc-shell *{box-sizing:border-box}.ldc-shell{--psoft:color-mix(in srgb,var(--lumiverse-primary) 15%,transparent);display:flex;flex-direction:column;min-height:430px;color:var(--lumiverse-text);font-size:12px;overflow:hidden}
body .ldc-toolbar-save-state[data-prism-save-status=syncing] i,body .ldc-savebar [data-save-status][data-prism-save-status=syncing]::before{background:#63d9ef;box-shadow:0 0 8px color-mix(in srgb,#63d9ef 48%,transparent)}body .ldc-toolbar-save-state[data-prism-save-status=awaiting] i,body .ldc-savebar [data-save-status][data-prism-save-status=awaiting]::before{background:#e4b94f;box-shadow:0 0 9px color-mix(in srgb,#e4b94f 55%,transparent)}.ldc-toolbar-save-state[data-prism-save-status=awaiting]{cursor:pointer;color:#e4c979}.ldc-toolbar-save-state[data-prism-save-status=awaiting]:hover{text-decoration:underline;text-underline-offset:2px}
[data-prism-streaming="true"] .ldc-prism-paint[data-prism-paint="gradient"]{background-image:none!important;color:var(--ldc-color,var(--ldc-fallback))!important;-webkit-text-fill-color:var(--ldc-color,var(--ldc-fallback))!important}
.ldc-toolbar-save-state{appearance:none;border:0;background:transparent;font:inherit;padding:0}.ldc-registry-warning{border-color:color-mix(in srgb,#e4b94f 55%,var(--lumiverse-border))!important;color:#e4c979!important}.ldc-registry-import{display:grid;gap:12px;padding:16px}.ldc-registry-import textarea{width:100%;min-height:250px;resize:vertical;padding:12px;border:1px solid var(--lumiverse-border);border-radius:11px;background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text);font:11px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace}.ldc-registry-import-actions{display:flex;justify-content:flex-end;gap:8px}
.ldc-review-inbox .ldc-heading{position:sticky;top:-18px;z-index:2;padding:14px 0;background:color-mix(in srgb,var(--lumiverse-bg-elevated) 98%,transparent)}.ldc-review-list{display:grid;gap:11px}.ldc-observation-card{padding:13px;border:1px solid color-mix(in srgb,#e4b94f 38%,var(--lumiverse-border));border-radius:13px;background:linear-gradient(145deg,color-mix(in srgb,#e4b94f 7%,transparent),var(--lumiverse-fill-subtle))}.ldc-observation-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.ldc-observation-head h4{margin:0;font-size:12px}.ldc-observation-meta{margin-top:3px;color:var(--lumiverse-text-dim);font-size:8.5px}.ldc-observation-color{display:flex;align-items:center;gap:6px;color:var(--lumiverse-text-muted);font-size:9px}.ldc-observation-color i{width:12px;height:12px;border-radius:50%;background:var(--observed);box-shadow:0 0 8px color-mix(in srgb,var(--observed) 55%,transparent)}.ldc-observation-examples{display:grid;gap:5px;margin:10px 0;padding:9px;border-left:2px solid color-mix(in srgb,#e4b94f 52%,transparent);color:var(--lumiverse-text-muted);font-size:9.5px}.ldc-observation-form{display:grid;grid-template-columns:minmax(110px,1fr) 110px minmax(150px,1fr);gap:8px}.ldc-observation-actions{display:flex;justify-content:flex-end;gap:7px;margin-top:10px}.ldc-observation-empty{display:grid;place-items:center;min-height:280px;color:var(--lumiverse-text-dim);text-align:center}.ldc-tentative-label{margin-top:12px;padding-top:10px;border-top:1px solid var(--lumiverse-border);color:#e4c979}.ldc-tentative-person{cursor:pointer;border-color:color-mix(in srgb,#e4b94f 30%,transparent)}.ldc-tentative-person .ldc-inline-swatch{background:#e4b94f}
@media(max-width:620px){.ldc-observation-form{grid-template-columns:1fr}.ldc-observation-actions{justify-content:stretch}.ldc-observation-actions .ldc-btn{flex:1}}
.ldc-persona-master{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:14px 18px 0;padding:10px 12px;border:1px solid var(--lumiverse-border);border-radius:11px;background:var(--lumiverse-fill-subtle);cursor:pointer}.ldc-persona-master span{display:grid;gap:2px}.ldc-persona-master strong{font-size:10px}.ldc-persona-master small{color:var(--lumiverse-text-dim);font-size:8.5px}
.ldc-toolbar-host{display:flex;align-items:center;gap:4px}.ldc-toolbar-button{display:grid;place-items:center;width:28px;height:28px;padding:0;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--lumiverse-primary);opacity:.8;cursor:pointer}.ldc-toolbar-button:hover{opacity:1;border-color:var(--lumiverse-border);background:var(--lumiverse-fill-subtle);filter:drop-shadow(0 0 7px color-mix(in srgb,var(--lumiverse-primary) 45%,transparent))}.ldc-toolbar-button svg{width:16px}.ldc-toolbar-save-state,.ldc-savebar [data-save-status]{display:inline-flex;align-items:center;gap:5px;white-space:nowrap;color:var(--lumiverse-text-dim);font-size:9px;font-weight:700}.ldc-toolbar-save-state i,.ldc-savebar [data-save-status]::before{content:"";width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:#73dfbd;box-shadow:0 0 8px color-mix(in srgb,#73dfbd 45%,transparent)}.ldc-toolbar-save-state[data-prism-save-status=pending] i,.ldc-toolbar-save-state[data-prism-save-status=saving] i,.ldc-savebar [data-save-status][data-prism-save-status=pending]::before,.ldc-savebar [data-save-status][data-prism-save-status=saving]::before{background:#d6af55;box-shadow:0 0 8px color-mix(in srgb,#d6af55 45%,transparent)}.ldc-toolbar-save-state[data-prism-save-status=error] i,.ldc-savebar [data-save-status][data-prism-save-status=error]::before{background:var(--lumiverse-danger);box-shadow:0 0 8px color-mix(in srgb,var(--lumiverse-danger) 45%,transparent)}
.ldc-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 10px;border-bottom:1px solid var(--lumiverse-border)}.ldc-tabs{display:flex;gap:4px}.ldc-tab,.ldc-engine button{border:0;border-radius:9px;background:transparent;color:var(--lumiverse-text-muted);font-size:11px;font-weight:800;cursor:pointer}.ldc-tab{padding:7px 11px}.ldc-tab[data-active=true]{color:var(--lumiverse-text);background:var(--psoft)}.ldc-top-actions{display:flex;align-items:center;justify-content:flex-end;gap:7px;min-width:0}.ldc-engine-copy{max-width:270px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--lumiverse-text-dim);font-size:9px}.ldc-engine{display:flex;flex:0 0 auto;gap:3px;padding:3px;border:1px solid var(--lumiverse-border);border-radius:11px;background:var(--lumiverse-fill-subtle)}.ldc-engine button{padding:5px 9px;font-size:10px}.ldc-engine button[data-active=true]{color:var(--lumiverse-text);background:var(--psoft)}.ldc-icon{display:grid;place-items:center;width:29px;height:29px;padding:0;border:1px solid transparent;border-radius:9px;background:transparent;color:var(--lumiverse-text-dim);cursor:pointer}.ldc-icon:hover,.ldc-icon[data-active=true]{border-color:var(--lumiverse-border);background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text)}.ldc-icon svg{width:15px}
.ldc-setup{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:10px 10px 0;padding:10px 11px;border:1px solid color-mix(in srgb,var(--lumiverse-primary) 28%,var(--lumiverse-border));border-radius:13px;background:linear-gradient(90deg,var(--psoft),color-mix(in srgb,#5db9ff 7%,transparent))}.ldc-setup-copy{display:flex;align-items:center;gap:9px}.ldc-setup-icon{display:grid;place-items:center;width:29px;height:29px;border-radius:10px;background:var(--psoft);color:var(--lumiverse-primary)}.ldc-setup-icon svg{width:15px}.ldc-setup-title{font-size:11px;font-weight:850}.ldc-setup-desc{margin-top:2px;color:var(--lumiverse-text-dim);font-size:9.5px}.ldc-mini,.ldc-btn{border:1px solid var(--lumiverse-border);border-radius:9px;background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text-muted);padding:7px 9px;font-size:9px;font-weight:820;cursor:pointer}.ldc-mini{border-color:var(--lumiverse-primary);background:var(--psoft);color:var(--lumiverse-primary);white-space:nowrap}
 .ldc-main{display:grid;grid-template-columns:minmax(155px,205px) minmax(0,1fr);flex:1;min-height:330px;margin-top:10px;border-top:1px solid var(--lumiverse-border);border-bottom:1px solid var(--lumiverse-border)}.ldc-side{padding:12px 9px;overflow:auto;max-height:430px;scrollbar-gutter:stable;border-right:1px solid var(--lumiverse-border)}.ldc-side-label{padding:0 8px 7px;color:var(--lumiverse-text-dim);font-size:8.5px;font-weight:850;letter-spacing:.11em;text-transform:uppercase}.ldc-person{display:flex;align-items:center;gap:9px;width:100%;padding:8px;border:1px solid transparent;border-radius:11px;cursor:pointer}.ldc-person+.ldc-person{margin-top:3px}.ldc-person:hover{background:var(--lumiverse-fill-subtle)}.ldc-person[data-active=true]{border-color:var(--lumiverse-primary);background:var(--psoft)}.ldc-avatar{position:relative;display:grid;place-items:center;width:32px;height:32px;flex:0 0 auto;border-radius:10px;background:linear-gradient(145deg,var(--lumiverse-primary),#313444);color:#fff;font-size:9.5px;font-weight:900}.ldc-inline-swatch{position:absolute;right:-3px;bottom:-3px;width:14px;height:14px;border:2px solid var(--lumiverse-bg-elevated);border-radius:50%;background:var(--swatch-paint,var(--swatch,#777));box-shadow:0 0 8px color-mix(in srgb,var(--swatch,#777) 42%,transparent);overflow:hidden;cursor:pointer}.ldc-inline-swatch::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px rgba(255,255,255,.24);pointer-events:none}.ldc-inline-picker{position:absolute;inset:-6px;width:26px;height:26px;padding:0;border:0;opacity:0;cursor:pointer}.ldc-person-copy{min-width:0;flex:1}.ldc-person-name{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px;font-weight:800}.ldc-person-source{display:block;margin-top:2px;color:var(--lumiverse-text-dim);font-size:9px}.ldc-side-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid var(--lumiverse-border)}.ldc-side-actions [data-action=add-person]{grid-column:1/-1}.ldc-panel-buttons{display:flex;gap:6px}
.ldc-panel{min-width:0;padding:19px 20px 16px}.ldc-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:15px}.ldc-profile{display:flex;align-items:center;gap:11px}.ldc-profile-avatar{display:grid;place-items:center;width:41px;height:41px;border-radius:13px;background:linear-gradient(145deg,var(--lumiverse-primary),#34364b);color:#fff;font-weight:900}.ldc-heading h3{margin:0;font-size:16px}.ldc-sub{margin-top:3px;color:var(--lumiverse-text-dim);font-size:10px}.ldc-chip,.ldc-bridge{border:1px solid var(--lumiverse-border);border-radius:999px;padding:4px 7px;background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text-dim);font-size:8.5px}.ldc-preview{margin-bottom:14px;padding:10px 11px;border:1px solid var(--lumiverse-border);border-radius:11px;background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text-muted);font-size:10.5px}.ldc-preview strong{color:var(--preview)}.ldc-field{display:block;margin-bottom:12px}.ldc-label{display:flex;justify-content:space-between;margin-bottom:6px;color:var(--lumiverse-text-muted);font-size:10px;font-weight:750}.ldc-hint{color:var(--lumiverse-text-dim);font-size:8.5px}.ldc-color-row{display:grid;grid-template-columns:55px 1fr;gap:9px}.ldc-picker{width:55px;height:38px;padding:3px;border:1px solid var(--lumiverse-border);border-radius:10px;background:var(--lumiverse-fill)}.ldc-input,.ldc-select{width:100%;height:38px;padding:0 10px;border:1px solid var(--lumiverse-border);border-radius:10px;background:var(--lumiverse-fill);color:var(--lumiverse-text);font-size:11px}.ldc-actions{display:flex;align-items:center;justify-content:space-between;margin-top:15px}.ldc-autosave{color:var(--lumiverse-text-dim);font-size:8.5px}.ldc-primary{background:var(--lumiverse-primary);color:var(--lumiverse-primary-contrast,#fff)}.ldc-empty{padding:34px;text-align:center;color:var(--lumiverse-text-dim)}
.ldc-settings{padding:18px 20px;min-height:320px}.ldc-add-person{box-sizing:border-box;width:100%;min-height:238px;padding:18px 20px}.ldc-add-person .ldc-heading{margin-bottom:16px}.ldc-add-person .ldc-actions{margin-top:15px}.ldc-settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ldc-card{padding:12px;border:1px solid var(--lumiverse-border);border-radius:12px;background:var(--lumiverse-fill-subtle)}.ldc-card h4{margin:0 0 5px}.ldc-card p{color:var(--lumiverse-text-dim);font-size:9.5px;line-height:1.45}.ldc-status{display:flex;justify-content:space-between;padding:10px 11px;color:var(--lumiverse-text-dim);font-size:9px}.ldc-loading{display:grid;place-items:center;min-height:380px}.ldc-error{margin:16px;padding:16px;border:1px solid var(--lumiverse-danger);border-radius:12px;color:var(--lumiverse-danger)}
.ldc-dom-dialogue,.ldc-inline-color{color:var(--ldc-color)!important}.ldc-dom-dialogue{cursor:context-menu}.ldc-dom-dialogue[data-prism-confidence-level=low]{text-decoration-line:underline;text-decoration-style:dotted;text-decoration-color:color-mix(in srgb,currentColor 55%,transparent);text-underline-offset:.18em}.ldc-dom-whole,.ldc-dom-whole *:not(a):not(button){color:var(--ldc-color)!important}@media(max-width:620px){.ldc-main{grid-template-columns:minmax(132px,155px) minmax(0,1fr)}.ldc-panel{padding:15px 12px}.ldc-side{padding:10px 7px}.ldc-person{padding:7px 6px}.ldc-person-source,.ldc-engine-copy{display:none}.ldc-settings-grid{grid-template-columns:1fr}}
.ldc-tab{border-radius:0;border-bottom:2px solid transparent}.ldc-tab[data-active=true]{border-bottom-color:var(--lumiverse-primary);background:transparent}.ldc-heading h3{font-size:14px}
.ldc-channel-tabs,.ldc-mode-tabs{display:flex;gap:5px;margin-bottom:12px}.ldc-channel-tabs button,.ldc-mode-tabs button{flex:1;border:1px solid var(--lumiverse-border);border-radius:9px;padding:7px;background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text-muted);font-size:9px;font-weight:800;cursor:pointer}.ldc-channel-tabs button[data-active=true],.ldc-mode-tabs button[data-active=true]{border-color:var(--lumiverse-primary);background:var(--psoft);color:var(--lumiverse-primary)}.ldc-paint-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.ldc-advanced{margin-top:10px;padding-top:10px;border-top:1px solid var(--lumiverse-border)}.ldc-preview-line{display:block;margin-top:5px}.ldc-prism-paint{color:var(--ldc-color,var(--ldc-fallback))!important}.ldc-dom-dialogue,.ldc-dom-thought{cursor:context-menu}.ldc-dom-thought{font-style:italic}.ldc-prism-unpainted{color:inherit!important;background-image:none!important;-webkit-text-fill-color:currentColor!important;text-decoration-line:underline;text-decoration-style:dotted;text-decoration-color:transparent;text-underline-offset:.18em}.ldc-prism-unpainted[data-prism-confidence-level=low]{text-decoration-color:color-mix(in srgb,currentColor 22%,transparent)}.ldc-prism-unpainted:hover,.ldc-prism-unpainted:focus-visible,.ldc-prism-reviewing{border-radius:.25em;background:color-mix(in srgb,var(--lumiverse-primary) 10%,transparent);text-decoration-color:color-mix(in srgb,var(--lumiverse-primary) 65%,transparent);outline:none}@supports ((background-clip:text) or (-webkit-background-clip:text)){.ldc-prism-paint[data-prism-paint=gradient]{background-image:var(--ldc-gradient)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:100% 100%!important;background-color:transparent!important;background-clip:text!important;-webkit-background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important}.ldc-dom-whole.ldc-prism-paint[data-prism-paint=gradient] *{background-image:var(--ldc-gradient)!important;background-clip:text!important;-webkit-background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important}.ldc-prism-paint[data-prism-paint=gradient]::selection{color:HighlightText!important;-webkit-text-fill-color:HighlightText;background:Highlight}}
.ldc-shell{--prism-line:color-mix(in srgb,var(--lumiverse-primary) 24%,var(--lumiverse-border));position:relative;min-height:500px;border:1px solid var(--prism-line);border-radius:16px;background:radial-gradient(circle at 72% -20%,color-mix(in srgb,#6ee7ff 8%,transparent),transparent 38%),radial-gradient(circle at 15% 110%,color-mix(in srgb,var(--lumiverse-primary) 10%,transparent),transparent 42%),var(--lumiverse-bg-elevated);box-shadow:0 24px 70px rgba(0,0,0,.42),inset 0 1px rgba(255,255,255,.045)}.ldc-shell::before{content:"";position:absolute;z-index:8;inset:0 0 auto;height:2px;pointer-events:none;background:linear-gradient(90deg,transparent,#c37cff,#64d9ff,#8cffbd,transparent);opacity:.72}.ldc-main-wrap{position:relative;display:flex;flex:1;min-height:0}.ldc-main{width:100%;margin-top:10px}.ldc-panel{position:relative;min-height:0;max-height:470px;padding:0;overflow:auto;background:color-mix(in srgb,var(--lumiverse-bg-elevated) 88%,transparent)}
.ldc-editor-head{position:sticky;top:0;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 18px;border-bottom:1px solid var(--lumiverse-border);background:color-mix(in srgb,var(--lumiverse-bg-elevated) 88%,transparent);backdrop-filter:blur(18px)}.ldc-editor-head h3{margin:0;font-size:14px}.ldc-preview{margin:15px 18px;padding:15px;border:1px solid var(--prism-line);border-radius:14px;background:linear-gradient(145deg,color-mix(in srgb,var(--lumiverse-primary) 9%,transparent),transparent 62%);font-size:11px;line-height:1.65}.ldc-preview-line{display:block;margin-top:3px}.ldc-preview [data-prism-paint]{color:var(--ldc-color,var(--ldc-fallback))!important}.ldc-editor-controls{padding:0 18px 18px}.ldc-editor-switch{display:flex;align-items:center;justify-content:space-between;gap:14px}.ldc-channel-tabs{display:flex;gap:5px;margin:0}.ldc-channel-tabs button{min-width:78px}.ldc-mode-select{display:flex;align-items:center;gap:8px;color:var(--lumiverse-text-dim);font-size:9px;font-weight:800}.ldc-mode-select .ldc-select{width:92px;height:31px}.ldc-enable{display:flex;align-items:center;gap:7px;margin:12px 0 9px;color:var(--lumiverse-text-muted);font-size:10px}.ldc-thought-link{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0 9px;padding:8px 10px;border:1px solid var(--lumiverse-border);border-radius:10px;background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text-muted);font-size:9px}.ldc-thought-link label{display:flex;align-items:center;gap:7px;cursor:pointer}.ldc-thought-link span:last-child{color:var(--lumiverse-text-dim);font-size:8px}.ldc-editor-controls[data-thought-linked=true] .ldc-gradient-editor,.ldc-editor-controls[data-thought-linked=true] .ldc-hex-row,.ldc-editor-controls[data-thought-linked=true] .ldc-direction,.ldc-editor-controls[data-thought-linked=true] .ldc-mode-select{opacity:.72}.ldc-gradient-editor{display:grid;grid-template-columns:auto minmax(100px,1fr) auto;align-items:center;gap:10px;padding:13px;border:1px solid var(--lumiverse-border);border-radius:13px;background:var(--lumiverse-fill-subtle)}.ldc-stop{position:relative;display:block;width:31px;height:31px;cursor:pointer}.ldc-stop input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.ldc-stop span{display:block;width:31px;height:31px;border:2px solid color-mix(in srgb,#fff 35%,var(--lumiverse-border));border-radius:10px;background:var(--stop);box-shadow:0 5px 14px color-mix(in srgb,var(--stop) 28%,transparent)}.ldc-gradient-rail{height:11px;border-radius:999px;background:var(--editor-gradient);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14),0 0 18px color-mix(in srgb,var(--lumiverse-primary) 15%,transparent)}.ldc-hex-row{display:grid;grid-template-columns:1fr;gap:10px;margin-top:8px}.ldc-hex-row[data-gradient=true]{grid-template-columns:1fr 1fr}.ldc-hex-row .ldc-input{height:34px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.ldc-direction{display:flex;align-items:end;justify-content:space-between;gap:10px;margin-top:9px}.ldc-direction label{display:flex;align-items:center;gap:8px;color:var(--lumiverse-text-dim);font-size:9px;font-weight:800}.ldc-direction .ldc-input{width:76px;height:34px}.ldc-details{margin-top:14px;border-top:1px solid var(--lumiverse-border)}.ldc-details summary{padding:13px 0;color:var(--lumiverse-text-muted);font-size:9px;font-weight:800;letter-spacing:.04em;cursor:pointer}.ldc-details[open] summary{color:var(--lumiverse-text)}.ldc-savebar{position:sticky;bottom:0;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 18px;border-top:1px solid var(--lumiverse-border);background:color-mix(in srgb,var(--lumiverse-bg-elevated) 91%,transparent);backdrop-filter:blur(18px);color:var(--lumiverse-text-dim);font-size:9px}.ldc-savebar [data-save-status=error]{color:var(--lumiverse-danger)}.ldc-review{border:1px solid color-mix(in srgb,var(--lumiverse-primary) 40%,var(--lumiverse-border));border-radius:999px;padding:5px 8px;background:var(--psoft);color:var(--lumiverse-primary);font-size:8.5px;font-weight:800;cursor:pointer}
.ldc-settings{position:absolute;z-index:7;top:0;right:0;bottom:0;width:min(520px,86%);min-height:0;padding:18px 20px;overflow:auto;border-left:1px solid var(--prism-line);background:color-mix(in srgb,var(--lumiverse-bg-elevated) 96%,transparent);box-shadow:-24px 0 60px rgba(0,0,0,.38);backdrop-filter:blur(22px)}
.ldc-gradient-editor[data-stops="1"]{grid-template-columns:1fr;padding:8px;background:linear-gradient(135deg,color-mix(in srgb,var(--editor-solid) 20%,var(--lumiverse-fill-subtle)),var(--lumiverse-fill-subtle))}.ldc-gradient-editor[data-stops="1"] .ldc-stop{width:100%;height:42px}.ldc-gradient-editor[data-stops="1"] .ldc-stop span{width:100%;height:42px;border-radius:10px}.ldc-gradient-editor[data-stops="2"]{grid-template-columns:auto minmax(70px,1fr) auto}.ldc-gradient-editor[data-stops="3"]{grid-template-columns:auto minmax(44px,1fr) auto minmax(44px,1fr) auto}.ldc-hex-row[data-stops="1"]{grid-template-columns:1fr}.ldc-hex-row[data-stops="2"]{grid-template-columns:1fr 1fr}.ldc-hex-row[data-stops="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}.ldc-stop-count{width:62px;height:34px}.ldc-direction{justify-content:flex-start}.ldc-direction [data-action=swap-colors]{margin-left:auto}
.ldc-cortex-card{grid-column:1/-1}.ldc-cortex-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.ldc-health-dot{width:8px;height:8px;margin-top:3px;border-radius:50%;background:var(--lumiverse-text-dim)}.ldc-health-dot[data-state=ok]{background:#73dfbd;box-shadow:0 0 9px color-mix(in srgb,#73dfbd 45%,transparent)}.ldc-health-dot[data-state=error]{background:var(--lumiverse-danger)}.ldc-cortex-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:10px 0}.ldc-cortex-stats span{padding:8px;border:1px solid var(--lumiverse-border);border-radius:9px;color:var(--lumiverse-text-dim);font-size:8.5px}.ldc-cortex-stats b{display:block;color:var(--lumiverse-text);font-size:12px}.ldc-cortex-error{margin:8px 0;padding:8px;border-radius:8px;background:color-mix(in srgb,var(--lumiverse-danger) 10%,transparent);color:var(--lumiverse-danger);font-size:9px}.ldc-conflicts{display:grid;gap:5px;margin:8px 0}.ldc-conflicts div{display:flex;justify-content:space-between;gap:10px;padding:7px 8px;border-radius:8px;background:var(--lumiverse-fill)}.ldc-conflicts span{color:var(--lumiverse-text-dim);font-size:8.5px}.ldc-prism-segment[data-prism-needs-color=true]{text-decoration-line:underline;text-decoration-style:dashed;text-decoration-color:color-mix(in srgb,#d6af55 60%,transparent);text-underline-offset:.18em}
@supports ((background-clip:text) or (-webkit-background-clip:text)){.ldc-preview [data-prism-paint=gradient]{background-image:var(--ldc-gradient)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:100% 100%!important;background-clip:text!important;-webkit-background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important}}
@media(max-width:620px){.ldc-shell{min-height:460px}.ldc-main{grid-template-columns:minmax(126px,145px) minmax(0,1fr)}.ldc-editor-head,.ldc-savebar{padding-left:12px;padding-right:12px}.ldc-editor-controls,.ldc-preview{margin-left:12px;margin-right:12px}.ldc-editor-controls{padding-left:0;padding-right:0}.ldc-editor-switch{align-items:stretch;flex-direction:column}.ldc-channel-tabs button{min-width:0}.ldc-mode-select{justify-content:space-between}.ldc-review{max-width:102px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
/* Settings is a full workspace, not a cramped side drawer. */
.ldc-settings{inset:0;width:100%;padding:18px 20px;border-left:0;box-shadow:none;background:color-mix(in srgb,var(--lumiverse-bg-elevated) 98%,transparent)}
.ldc-settings-heading{margin-bottom:14px;padding-bottom:13px;border-bottom:1px solid var(--lumiverse-border)}
.ldc-settings-grid{grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;gap:12px}
.ldc-settings-card{display:flex;min-width:0;min-height:188px;flex-direction:column}
.ldc-settings-card-wide{grid-column:1/-1;min-height:0}
.ldc-settings-card h4{font-size:11px}
.ldc-settings-card p{margin:0 0 13px;line-height:1.55}
.ldc-card-controls{display:flex;flex:1;flex-direction:column;justify-content:flex-end;gap:10px}
.ldc-card-controls .ldc-select{flex:0 0 38px}
.ldc-setting-check{display:flex;align-items:flex-start;gap:7px;min-height:30px;color:var(--lumiverse-text-muted);font-size:9.5px;line-height:1.35}
.ldc-setting-check input{margin:1px 0 0;flex:0 0 auto}
.ldc-card-controls-action{align-items:flex-start}
.ldc-card-controls-action .ldc-btn{min-height:34px}
.ldc-settings code{font:inherit;color:var(--lumiverse-text-muted)}
@media(max-width:620px){.ldc-settings{width:100%;padding:14px 12px}.ldc-settings-grid{grid-template-columns:1fr}.ldc-settings-card{min-height:0}.ldc-cortex-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.ldc-cortex-card{grid-column:1}}
`;
const VERBS = [
    'say', 'said', 'says', 'ask', 'asked', 'asks', 'reply', 'replied', 'replies', 'answer', 'answered', 'answers',
    'announce', 'announced', 'announces', 'observe', 'observed', 'observes', 'remark', 'remarked', 'remarks', 'state', 'stated', 'states', 'declare', 'declared', 'declares', 'note', 'noted', 'notes', 'explain', 'explained', 'explains', 'add', 'added', 'adds', 'continue', 'continued', 'continues',
    'whisper', 'whispered', 'whispers', 'murmur', 'murmured', 'murmurs', 'mutter', 'muttered', 'mutters', 'breathe', 'breathed', 'breathes', 'hiss', 'hissed', 'hisses', 'growl', 'growled', 'growls', 'drawl', 'drawled', 'drawls', 'intone', 'intoned', 'intones',
    'shout', 'shouted', 'shouts', 'yell', 'yelled', 'yells', 'cry', 'cried', 'cries', 'call', 'called', 'calls', 'snap', 'snapped', 'snaps', 'bark', 'barked', 'barks', 'exclaim', 'exclaimed', 'exclaims',
    'retort', 'retorted', 'retorts', 'protest', 'protested', 'protests', 'insist', 'insisted', 'insists', 'warn', 'warned', 'warns', 'demand', 'demanded', 'demands', 'urge', 'urged', 'urges', 'correct', 'corrected', 'corrects', 'admit', 'admitted', 'admits', 'concede', 'conceded', 'concedes', 'agree', 'agreed', 'agrees', 'object', 'objected', 'objects', 'promise', 'promised', 'promises',
    'laugh', 'laughed', 'laughs', 'sigh', 'sighed', 'sighs', 'scoff', 'scoffed', 'scoffs', 'groan', 'groaned', 'groans', 'repeat', 'repeated', 'repeats', 'echo', 'echoed', 'echoes'
];
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
function normalizeHex(value) { const raw = String(value || '').trim(), short = raw.match(/^#?([0-9a-f]{3})$/i); if (short)
    return `#${short[1].split('').map(c => c + c).join('').toUpperCase()}`; const full = raw.match(/^#?([0-9a-f]{6})$/i); return full ? `#${full[1].toUpperCase()}` : null; }
function safePaint(raw, fallback = '#B58CFF') { const anchor = normalizeHex(raw?.anchor) || normalizeHex(fallback) || '#B58CFF', stops = (Array.isArray(raw?.stops) ? raw.stops : []).map(normalizeHex).filter(Boolean).slice(0, 4); return raw?.mode === 'gradient' && stops.length >= 2 ? { mode: 'gradient', stops, angle: Math.max(0, Math.min(360, Number(raw.angle) || 90)), anchor } : { mode: 'solid', stops: [stops[0] || anchor], angle: 90, anchor }; }
function paintSignature(raw, fallback = '#B58CFF') { const p = safePaint(raw, fallback); return JSON.stringify({ mode: p.mode, stops: p.stops, angle: p.angle, anchor: p.anchor }); }
function bindingRegistryColor(binding) { return binding ? (normalizeHex(binding?.channels?.dialogue?.paint?.stops?.[0]) || normalizeHex(binding?.color)) : null; }
function safeChannels(binding) { const raw = binding?.channels, color = bindingRegistryColor(binding) || '#B58CFF', dialoguePaint = safePaint(raw?.dialogue?.paint, color); dialoguePaint.stops[0] = color; dialoguePaint.anchor = color; const dialogue = { enabled: raw?.dialogue?.enabled !== false, paint: dialoguePaint }, storedThought = safePaint(raw?.thought?.paint, color); storedThought.anchor = color; const explicit = typeof raw?.thought?.linkedToDialogue === 'boolean' ? raw.thought.linkedToDialogue : null, linked = explicit ?? (!raw?.thought?.paint || paintSignature(storedThought, color) === paintSignature(dialogue.paint, color)), thoughtPaint = linked ? safePaint(dialogue.paint, color) : storedThought; thoughtPaint.anchor = color; return { dialogue, thought: { enabled: raw?.thought?.enabled === true, linkedToDialogue: linked, paint: thoughtPaint } }; }
function paintAttrs(paint, extraClass = '') { const p = safePaint(paint), gradient = p.mode === 'gradient' ? `--ldc-gradient:linear-gradient(${p.angle}deg,${p.stops.join(',')});` : ''; return `class="ldc-prism-paint ${extraClass}" data-prism-paint="${p.mode}" style="--ldc-fallback:${p.anchor};--ldc-color:${p.stops[0]};${gradient}"`; }
function paintBackground(raw, fallback = '#777777') { const p = safePaint(raw, fallback); return p.mode === 'gradient' && p.stops.length >= 2 ? `linear-gradient(${p.angle}deg,${p.stops.join(',')})` : p.stops[0]; }
function harmonicColor(value) { const hex = normalizeHex(value) || '#B58CFF', r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255, max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0, h = d ? (max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 : 0, hue = (h + 42 + 360) % 360, light = Math.min(.82, l + .07), chroma = (1 - Math.abs(2 * light - 1)) * Math.max(.48, s), x = chroma * (1 - Math.abs((hue / 60) % 2 - 1)), m = light - chroma / 2, [rr, gg, bb] = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x] : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x]; return `#${[rr, gg, bb].map(n => Math.round((n + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`; }
function esc(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }
function reEsc(value) { return String(value).replace(/[.*+?^$()|[\]{}\\]/g, '\\$&'); }
function hashText(value) { let hash = 2166136261; for (const char of String(value || '')) {
    hash ^= char.codePointAt(0) || 0;
    hash = Math.imul(hash, 16777619);
} return (hash >>> 0).toString(36); }
function initials(name) { return String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase(); }
function sourceLabel(s) { return ({ cortex: 'Cortex · imported', 'cortex-registry': 'Cortex · registry-only', transcript: 'Transcript · imported', preset: 'Preset · imported', library: 'Library · reused', generated: 'Generated', manual: 'Manual · pinned', 'manual-roster': 'Added manually' })[s] || s || 'Unassigned'; }
function evidenceLabel(s) { return ({ manual: 'manual correction', 'existing-color': 'existing color tag', 'speaker-label': 'speaker label', 'reporting-verb': 'reporting verb', 'structural-speech-tag': 'structural speech tag', 'speech-noun': 'speech noun', 'action-beat': 'action beat', 'paragraph-continuity': 'same-paragraph continuity', 'previous-line': 'previous-line action', alternation: 'two-speaker alternation', 'bubble-author': 'bubble author', fallback: 'aggressive fallback', unresolved: 'no reliable evidence' })[s] || s; }
function normalizeEngine(value) { return ['dom', 'hybrid', 'llm'].includes(value) ? value : 'dom'; }
function engineLabel(value) { return ({ dom: 'Local', hybrid: 'Hybrid', llm: 'LLM sidecar' })[normalizeEngine(value)]; }
function engineDescription(value) { return ({ dom: 'Visual only · heuristic paint', hybrid: 'Model tags first · local repair', llm: 'Model tags only · no local fill' })[normalizeEngine(value)]; }
export function setup(ctx) {
    const removeStyle = ctx.dom.addStyle(CSS), pending = new Map(), signatures = new Map(), dirty = new Set(), hydratingMessages = new Set(), activeGenerationIds = new Set(), streamingMessageIds = new Set();
    let modal = null, addModal = null, importModal = null, state = null, activeTab = 'character', activeChannel = 'dialogue', selectedId = null, sideScroll = 0, panelScroll = 0, settingsOpen = false, reviewOpen = false, busy = false, saveStatus = 'saved', hydrationStatus = 'idle', pendingReviewCount = 0, reviewIndex = 0, toolbarInjection = null, refreshTimer = 0, saveTimer = 0, longTimer = 0, applying = false, revision = 0, saveGeneration = 0, saveQueue = Promise.resolve(), stateLoadPromise = null, lastRoundtripMs = 0, lastBackendError = '', themeColorCache = null, themeColorSignature = '';
    const request = (type, data = {}, timeoutMs = 15000) => new Promise((resolve, reject) => { const requestId = uid(), startedAt = performance.now(), timer = setTimeout(() => { pending.delete(requestId); lastBackendError = `${type} timed out`; reject(new Error(`Prism's backend did not answer ${type} within ${Math.round(timeoutMs / 1000)} seconds.`)); }, timeoutMs); pending.set(requestId, { resolve, reject, timer, startedAt, type }); ctx.sendToBackend({ type, requestId, ...data }); });
    const loadState = (sync = false) => { if (stateLoadPromise)
        return stateLoadPromise; stateLoadPromise = request('ldc_load_state', { importCortex: sync, scanTranscript: sync }, sync ? 60000 : 15000).finally(() => { stateLoadPromise = null; }); return stateLoadPromise; };
    const unsubBackend = ctx.onBackendMessage(payload => { const task = pending.get(payload?.requestId); if (!task)
        return; clearTimeout(task.timer); pending.delete(payload.requestId); lastRoundtripMs = Math.max(0, Math.round(performance.now() - task.startedAt)); if (payload.type === 'ldc_error') {
        lastBackendError = payload.error || 'Unknown error';
        task.reject(new Error(lastBackendError));
    }
    else {
        lastBackendError = '';
        task.resolve(payload);
    } });
    function characterStateKey(character) { return String(character?.binding?.speakerUid || `name:${String(character?.name || '').trim().toLowerCase()}`); }
    function acceptState(next) { const previous = state?.ok ? state : null, selected = previous?.characters?.find(character => String(character.id) === String(selectedId)) || null, selectedKey = characterStateKey(selected); if (previous && next?.ok && Array.isArray(next.characters)) {
        const order = new Map(previous.characters.map((character, index) => [characterStateKey(character), index]));
        next.characters = next.characters.map((character, index) => ({ character, index })).sort((left, right) => { const leftRank = order.has(characterStateKey(left.character)) ? order.get(characterStateKey(left.character)) : Number.MAX_SAFE_INTEGER, rightRank = order.has(characterStateKey(right.character)) ? order.get(characterStateKey(right.character)) : Number.MAX_SAFE_INTEGER; return leftRank - rightRank || left.index - right.index; }).map(item => item.character);
        const replacement = next.characters.find(character => characterStateKey(character) === selectedKey);
        if (replacement)
            selectedId = replacement.id;
    } state = next; pendingReviewCount = Math.max(0, Number(next?.pendingReviewCount) || 0); if (pendingReviewCount > 0 && hydrationStatus !== 'error')
        hydrationStatus = 'awaiting';
    else if (hydrationStatus === 'awaiting')
        hydrationStatus = 'idle'; revision++; signatures.clear(); schedule(true); refreshPrismStatus(); }
    function current() { return state?.characters?.find(c => String(c.id) === String(selectedId)) || state?.characters?.[0] || null; }
    function missingCount() { return (state?.characters || []).filter(c => !bindingRegistryColor(c.binding)).length + (state?.config?.personaEnabled !== false && state?.persona && !bindingRegistryColor(state.persona.binding) ? 1 : 0); }
    function setBusy(value) { busy = value; modal?.root.querySelectorAll('button,input,select').forEach(el => { el.disabled = value; }); }
    function visiblePrismStatus() { if (saveStatus === 'error' || hydrationStatus === 'error')
        return { state: 'error', label: 'Prism error' }; if (saveStatus === 'saving' || saveStatus === 'pending' || hydrationStatus === 'syncing')
        return { state: 'syncing', label: 'Syncing…' }; if (pendingReviewCount > 0)
        return { state: 'awaiting', label: `Awaiting review · ${pendingReviewCount}` }; return { state: 'saved', label: 'Saved' }; }
    function refreshPrismStatus() { const visible = visiblePrismStatus(); document.querySelectorAll('[data-prism-save-status],.ldc-shell [data-save-status]').forEach(node => { node.dataset.prismSaveStatus = visible.state; if (node instanceof HTMLButtonElement)
        node.setAttribute('aria-label', visible.label); const label = node.querySelector('[data-prism-save-label]'); if (label)
        label.textContent = visible.label;
    else
        node.textContent = visible.label; }); }
    function saveStatusLabel() { return visiblePrismStatus().label; }
    function setSaveStatus(value) { saveStatus = value; refreshPrismStatus(); }
    function setHydrationStatus(value) { hydrationStatus = value; refreshPrismStatus(); }
    async function perform(task) { if (busy)
        return; setBusy(true); try {
        await task();
    }
    catch (error) {
        if (saveStatus === 'saving' || saveStatus === 'pending')
            setSaveStatus('error');
        await ctx.ui.showConfirm({ title: 'Prism', message: error?.message || String(error), confirmLabel: 'Okay', cancelLabel: 'Close', variant: 'warning' });
    }
    finally {
        setBusy(false);
    } }
    function reviewKindLabel(kind) { return ({ 'new-speaker': 'Possible new character', 'unknown-color': 'Unknown colored speaker', 'color-drift': 'Unexpected color for known character', 'speaker-conflict': 'Tag conflicts with explicit prose', 'color-collision': 'Registry color collision', 'alias-suggestion': 'Possible alias' })[kind] || 'Hybrid observation'; }
    function reviewBinding(speakerUid) { return (state?.characters || []).map(character => character.binding).find(binding => binding?.speakerUid === speakerUid) || null; }
    function reviewPanel() {
        const groups = state?.reviewGroups || [], characters = (state?.characters || []).filter(character => character.binding?.speakerUid);
        if (!groups.length)
            return `<section class="ldc-settings ldc-review-inbox"><div class="ldc-heading ldc-settings-heading"><div><h3>Hybrid review</h3><div class="ldc-sub">No tentative registry evidence is waiting.</div></div><button class="ldc-btn" data-action="close-review">Back</button></div><div class="ldc-observation-empty"><div><strong>Registry caught up.</strong><br>New model tags will be studied after generation.</div></div></section>`;
        const cards = groups.map(group => {
            const matched = reviewBinding(group.matchedSpeakerUid), defaultName = group.inferredName || matched?.name || '', defaultColor = matched ? bindingRegistryColor(matched) : group.observedColor, options = [`<option value="">Create or choose manually</option>`, ...characters.map(character => `<option value="${esc(character.binding.speakerUid)}" ${character.binding.speakerUid === group.matchedSpeakerUid ? 'selected' : ''}>Merge with ${esc(character.name)}</option>`)].join(''), examples = (group.examples || []).map(example => `<span>“${esc(String(example).replace(/^[“”"]|[“”"]$/g, ''))}”</span>`).join('');
            return `<article class="ldc-observation-card" data-observation-group="${esc(group.groupKey)}"><div class="ldc-observation-head"><div><h4>${esc(reviewKindLabel(group.kind))}</h4><div class="ldc-observation-meta">${group.count} tagged line${group.count === 1 ? '' : 's'} · ${group.messageCount} message${group.messageCount === 1 ? '' : 's'} · ${Math.round(group.confidence * 100)}% confidence</div></div><span class="ldc-observation-color" style="--observed:${esc(group.observedColor)}"><i></i>${esc(group.observedColor)}</span></div><div class="ldc-observation-examples">${examples || '<span>No readable quote preview.</span>'}</div><div class="ldc-observation-form"><input class="ldc-input" data-review-role="name" value="${esc(defaultName)}" placeholder="Character name"><input class="ldc-input" data-review-role="color" value="${esc(defaultColor || group.observedColor)}" maxlength="7" aria-label="Registry color"><select class="ldc-select" data-review-role="merge">${options}</select></div><div class="ldc-observation-actions"><button class="ldc-btn" data-review-action="dismiss">Dismiss</button><button class="ldc-btn ldc-primary" data-review-action="approve">Approve</button></div></article>`;
        }).join('');
        return `<section class="ldc-settings ldc-review-inbox"><div class="ldc-heading ldc-settings-heading"><div><h3>Hybrid review</h3><div class="ldc-sub">Model output can propose registry changes, but only approval makes them confirmed.</div></div><button class="ldc-btn" data-action="close-review">Back</button></div><div class="ldc-review-list">${cards}</div></section>`;
    }
    function sidebar() {
        const rows = (state?.characters || []).map(c => { const canonical = bindingRegistryColor(c.binding) || '#777777', dialogue = safeChannels(c.binding).dialogue.paint, color = dialogue.stops[0] || canonical, swatch = paintBackground(dialogue, canonical); return `<div class="ldc-person" role="button" tabindex="0" data-character-id="${esc(c.id)}" data-active="${c.id === current()?.id}"><span class="ldc-avatar">${esc(initials(c.name))}<label class="ldc-inline-swatch" data-inline-swatch="${esc(c.id)}" style="--swatch:${esc(color)};--swatch-paint:${esc(swatch)}" title="Change ${esc(c.name)} dialogue color"><input class="ldc-inline-picker" data-inline-color="${esc(c.id)}" type="color" value="${esc(color)}" aria-label="Change ${esc(c.name)} dialogue color"></label></span><span class="ldc-person-copy"><span class="ldc-person-name">${esc(c.name)}</span><span class="ldc-person-source">${esc(sourceLabel(c.binding?.source || c.source))}</span></span><span>›</span></div>`; }).join('');
        const tentative = (state?.reviewGroups || []).filter(group => group.kind === 'new-speaker' || group.kind === 'unknown-color').map(group => `<div class="ldc-person ldc-tentative-person" role="button" tabindex="0" data-action="review-hydration"><span class="ldc-avatar">${esc(initials(group.inferredName || '?'))}<i class="ldc-inline-swatch" style="--swatch:${esc(group.observedColor)}"></i></span><span class="ldc-person-copy"><span class="ldc-person-name">${esc(group.inferredName || `Unknown ${group.observedColor}`)}</span><span class="ldc-person-source">Observed · ${group.count} line${group.count === 1 ? '' : 's'}</span></span><span>›</span></div>`).join('');
        return `<div class="ldc-side-label">Scene roster</div>${rows || '<div class="ldc-empty">No characters added yet.</div>'}${tentative ? `<div class="ldc-side-label ldc-tentative-label">Awaiting approval</div>${tentative}` : ''}<div class="ldc-side-actions"><button class="ldc-btn" data-action="add-person">+ Add character</button><button class="ldc-btn" data-action="assign">Assign missing</button><button class="ldc-btn" data-action="regenerate">Regenerate</button></div>`;
    }
    function charPanel(c) {
        if (!c)
            return '<div class="ldc-empty">No character is registered in this scene yet.</div>';
        return editorPanel(c, false);
    }
    function personaPanel() {
        const p = state?.persona;
        if (!p)
            return '<div class="ldc-empty">No active persona is selected.</div>';
        return editorPanel(p, true);
    }
    function editorPanel(target, isPersona) {
        const b = target.binding || {}, channels = safeChannels(b), color = channels.dialogue.paint.stops[0] || (isPersona ? '#7DB7FF' : '#B58CFF'), aliases = (b.aliases?.length ? b.aliases : target.aliases || []).join(', '), channel = channels[activeChannel], thoughtLinked = channels.thought.linkedToDialogue !== false, paint = channel.paint, gradient = paint.mode === 'gradient', stopCount = gradient ? (paint.stops.length >= 3 ? 3 : 2) : 1, stop1 = paint.stops[0], stop2 = paint.stops[1] || harmonicColor(stop1), stop3 = paint.stops[2] || stop1, stops = stopCount === 3 ? [stop1, stop2, stop3] : stopCount === 2 ? [stop1, stop2] : [stop1], rail = gradient ? `linear-gradient(${paint.angle}deg,${stops.join(',')})` : stop1, subtitle = isPersona ? (target.title || (target.isNarrator ? 'Narrator persona' : 'Active persona')) : `${target.status || 'active'} · ${(b.aliases || target.aliases || []).length} aliases`, swatches = stops.map((stop, index) => `${index ? '<div class="ldc-gradient-rail"></div>' : ''}<label class="ldc-stop" title="${index === 1 && stopCount === 3 ? 'Center' : 'Color stop'} ${index + 1}"><input data-role="picker${index ? `-${index + 1}` : ''}" type="color" value="${stop}"><span style="--stop:${stop}"></span></label>`).join(''), hexes = stops.map((stop, index) => `<input class="ldc-input" data-role="hex${index ? `-${index + 1}` : ''}" value="${stop}" maxlength="7" aria-label="Gradient stop ${index + 1}">`).join('');
        return `<div class="ldc-editor-head"><div class="ldc-profile"><span class="ldc-profile-avatar">${esc(initials(target.name))}</span><div><h3>${esc(target.name)}</h3><div class="ldc-sub">${esc(subtitle)}</div></div></div><span class="ldc-chip">${esc(sourceLabel(b.source || (isPersona ? 'active' : target.source)))}</span></div>${isPersona ? `<label class="ldc-persona-master"><span><strong>Enable persona colors</strong><small>Controls local paint, Hybrid tags, and prompt registry participation.</small></span><input type="checkbox" data-role="persona-enabled" ${state.config.personaEnabled !== false ? 'checked' : ''}></label>` : ''}<div class="ldc-preview"><span ${paintAttrs(channels.dialogue.paint, 'ldc-preview-dialogue')}>“Prism keeps this local and reversible.”</span><span ${paintAttrs(channels.thought.paint, 'ldc-preview-line ldc-preview-thought')}><i>This was, categorically, not safe.</i></span></div><div class="ldc-editor-controls" data-thought-linked="${activeChannel === 'thought' && thoughtLinked}"><div class="ldc-editor-switch"><div class="ldc-channel-tabs"><button data-channel="dialogue" data-active="${activeChannel === 'dialogue'}">Dialogue</button><button data-channel="thought" data-active="${activeChannel === 'thought'}">Thoughts</button></div><label class="ldc-mode-select"><span>Paint</span><select class="ldc-select" data-role="paint-mode"><option value="solid" ${!gradient ? 'selected' : ''}>Solid</option><option value="gradient" ${gradient ? 'selected' : ''}>Gradient</option></select></label></div>${activeChannel === 'thought' ? `<div class="ldc-thought-link"><label><input type="checkbox" data-role="thought-linked" ${thoughtLinked ? 'checked' : ''}> Match dialogue paint</label><span>${thoughtLinked ? 'Linked until customized' : 'Custom thought paint'}</span></div>` : ''}<label class="ldc-enable"><input type="checkbox" data-role="channel-enabled" ${channel.enabled ? 'checked' : ''}> Enable ${activeChannel} paint</label><div class="ldc-gradient-editor" data-stops="${stopCount}" style="--editor-gradient:${rail};--editor-solid:${stop1}">${swatches}</div><div class="ldc-hex-row" data-stops="${stopCount}">${hexes}</div>${gradient ? `<div class="ldc-direction"><label><span>Direction</span><input class="ldc-input" data-role="angle" type="number" min="0" max="360" value="${paint.angle}"></label><label><span>Stops</span><select class="ldc-select ldc-stop-count" data-role="stop-count"><option value="2" ${stopCount === 2 ? 'selected' : ''}>2</option><option value="3" ${stopCount === 3 ? 'selected' : ''}>3</option></select></label><button class="ldc-btn" data-action="swap-colors">Reverse direction</button></div>` : ''}<details class="ldc-details"><summary>Identity and attribution</summary><label class="ldc-field"><span class="ldc-label">Registry color <span class="ldc-hint">Always follows the first dialogue stop</span></span><input class="ldc-input" data-role="canonical-readout" value="${color}" readonly aria-readonly="true"></label>${isPersona ? `<label class="ldc-field"><span class="ldc-label">Persona dialogue</span><select class="ldc-select" data-role="auto-mode"><option value="off" ${state.config.autoUserMode === 'off' ? 'selected' : ''}>Off</option><option value="quoted" ${state.config.autoUserMode === 'quoted' ? 'selected' : ''}>Quoted dialogue only</option><option value="whole" ${state.config.autoUserMode === 'whole' ? 'selected' : ''}>Whole message</option></select></label>` : `<label class="ldc-field"><span class="ldc-label">Aliases <span class="ldc-hint">Comma-separated</span></span><input class="ldc-input" data-role="aliases" value="${esc(aliases)}" placeholder="Hugo, Mr. Vlad, narrator"></label>`}</details></div><div class="ldc-savebar"><span data-save-status="${saveStatus}">${saveStatusLabel(saveStatus)}</span>${isPersona ? '' : `<button class="ldc-btn" data-action="remove-character">Remove from scene</button>`}</div>`;
    }
    function cortexSummary() { const h = state?.cortex; if (!h)
        return state?.cortexAvailable ? 'Cortex available' : 'Cortex unavailable'; if (h.lastError || h.entitiesAvailable === false)
        return 'Cortex needs attention'; return `Cortex ${h.matchedEntries || 0}/${h.registryEntries || 0} linked · ${h.localOnlyCharacters || 0} local-only${h.conflicts?.length ? ` · ${h.conflicts.length} conflict${h.conflicts.length === 1 ? '' : 's'}` : ''}`; }
    function cortexHealthCard() { const h = state?.cortex || {}, conflicts = h.conflicts || [], needsAttention = Boolean(h.lastError || h.entitiesAvailable === false), last = h.lastSyncAt ? new Date(h.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'; return `<div class="ldc-card ldc-cortex-card"><div class="ldc-cortex-head"><div><h4>Cortex registry</h4><p>${esc(cortexSummary())} · Last sync ${esc(last)}</p></div><span class="ldc-health-dot" data-state="${needsAttention ? 'error' : h.macroResolved ? 'ok' : 'idle'}"></span></div>${needsAttention ? `<div class="ldc-cortex-error">${esc(h.lastError || 'Cortex entity list is unavailable.')}</div>` : ''}<div class="ldc-cortex-stats"><span><b>${h.importedEntries || 0}</b> imported</span><span><b>${h.repairedEntries || 0}</b> repaired</span><span><b>${h.registryOnlyCharacters || 0}</b> registry-only</span><span><b>${conflicts.length}</b> conflicts</span></div>${conflicts.length ? `<div class="ldc-conflicts">${conflicts.slice(0, 4).map(c => `<div><strong>${esc(c.name)}</strong><span>${esc(c.localColor || 'none')} local · ${esc(c.cortexColor)} Cortex · ${esc(c.source)}</span></div>`).join('')}</div>` : ''}<div class="ldc-panel-buttons"><button class="ldc-btn" data-action="cortex-sync">${needsAttention ? 'Retry connection' : 'Sync missing'}</button><button class="ldc-btn" data-action="cortex-repair">Repair links</button></div></div>`; }
    function registryHealthCard() { const missing = (state?.characters || []).filter(c => !bindingRegistryColor(c.binding)).length, unknown = document.querySelectorAll('.ldc-prism-segment[data-prism-speaker=""]').length, knownNoColor = document.querySelectorAll('.ldc-prism-segment[data-prism-needs-color=true]').length, legacyUnknown = new Set([...document.querySelectorAll('[data-prism-original-color][data-prism-speaker=""]')].map(x => normalizeHex(x.dataset.prismOriginalColor)).filter(Boolean)), owners = new Map(); for (const c of state?.characters || []) {
        const color = bindingRegistryColor(c.binding);
        if (color) {
            if (!owners.has(color))
                owners.set(color, []);
            owners.get(color).push(c.name);
        }
    } const collisions = [...owners.entries()].filter(([, names]) => names.length > 1); return `<div class="ldc-card ldc-cortex-card"><div class="ldc-cortex-head"><div><h4>Registry health</h4><p>Known speakers remain attributable even before paint is assigned.</p></div><span class="ldc-health-dot" data-state="${missing || unknown || collisions.length ? 'idle' : 'ok'}"></span></div><div class="ldc-cortex-stats"><span><b>${knownNoColor}</b> identified, no color</span><span><b>${unknown}</b> speaker unknown</span><span><b>${legacyUnknown.size}</b> unknown legacy colors</span><span><b>${collisions.length}</b> color collisions</span></div>${collisions.length ? `<div class="ldc-conflicts">${collisions.map(([color, names]) => `<div><strong>${esc(color)}</strong><span>${esc(names.join(' and '))}</span></div>`).join('')}</div>` : ''}<div class="ldc-panel-buttons"><button class="ldc-btn" data-action="health-review" ${unknown + knownNoColor ? '' : 'disabled'}>Review dialogue</button><button class="ldc-btn" data-action="assign">Assign missing colors (${missing})</button></div></div>`; }
    function editorPanelLegacy(target, isPersona) {
        const b = target.binding || {}, channels = safeChannels(b), color = channels.dialogue.paint.stops[0] || (isPersona ? '#7DB7FF' : '#B58CFF'), aliases = (b.aliases?.length ? b.aliases : target.aliases || []).join(', '), channel = channels[activeChannel], paint = channel.paint, gradient = paint.mode === 'gradient', stop1 = paint.stops[0], stop2 = paint.stops[1] || harmonicColor(stop1), rail = gradient ? `linear-gradient(${paint.angle}deg,${stop1},${stop2})` : stop1, subtitle = isPersona ? (target.title || (target.isNarrator ? 'Narrator persona' : 'Active persona')) : `${target.status || 'active'} · ${(b.aliases || target.aliases || []).length} aliases`;
        return `<div class="ldc-editor-head"><div class="ldc-profile"><span class="ldc-profile-avatar">${esc(initials(target.name))}</span><div><h3>${esc(target.name)}</h3><div class="ldc-sub">${esc(subtitle)}</div></div></div><span class="ldc-chip">${esc(sourceLabel(b.source || (isPersona ? 'active' : target.source)))}</span></div><div class="ldc-preview"><span ${paintAttrs(channels.dialogue.paint)}>“Prism keeps this local and reversible.”</span><span class="ldc-preview-line" ${paintAttrs(channels.thought.paint)}><i>This was, categorically, not safe.</i></span></div><div class="ldc-editor-controls"><div class="ldc-editor-switch"><div class="ldc-channel-tabs"><button data-channel="dialogue" data-active="${activeChannel === 'dialogue'}">Dialogue</button><button data-channel="thought" data-active="${activeChannel === 'thought'}">Thoughts</button></div><label class="ldc-mode-select"><span>Paint</span><select class="ldc-select" data-role="paint-mode"><option value="solid" ${!gradient ? 'selected' : ''}>Solid</option><option value="gradient" ${gradient ? 'selected' : ''}>Gradient</option></select></label></div><label class="ldc-enable"><input type="checkbox" data-role="channel-enabled" ${channel.enabled ? 'checked' : ''}> Enable ${activeChannel} paint</label><div class="ldc-gradient-editor" style="--editor-gradient:${rail}"><label class="ldc-stop" title="First color"><input data-role="picker" type="color" value="${stop1}"><span style="--stop:${stop1}"></span></label><div class="ldc-gradient-rail"></div>${gradient ? `<label class="ldc-stop" title="Second color"><input data-role="picker-2" type="color" value="${stop2}"><span style="--stop:${stop2}"></span></label>` : ''}</div><div class="ldc-hex-row" data-gradient="${gradient}"><input class="ldc-input" data-role="hex" value="${stop1}" maxlength="7">${gradient ? `<input class="ldc-input" data-role="hex-2" value="${stop2}" maxlength="7">` : ''}</div>${gradient ? `<div class="ldc-direction"><label><span>Direction</span><input class="ldc-input" data-role="angle" type="number" min="0" max="360" value="${paint.angle}"></label><button class="ldc-btn" data-action="swap-colors">Swap colors</button></div>` : ''}<details class="ldc-details"><summary>Identity and attribution</summary><label class="ldc-field"><span class="ldc-label">Registry color <span class="ldc-hint">Always follows the first dialogue stop</span></span><input class="ldc-input" data-role="canonical-readout" value="${color}" readonly aria-readonly="true"></label>${isPersona ? `<label class="ldc-field"><span class="ldc-label">Persona dialogue</span><select class="ldc-select" data-role="auto-mode"><option value="off" ${state.config.autoUserMode === 'off' ? 'selected' : ''}>Off</option><option value="quoted" ${state.config.autoUserMode === 'quoted' ? 'selected' : ''}>Quoted dialogue only</option><option value="whole" ${state.config.autoUserMode === 'whole' ? 'selected' : ''}>Whole message</option></select></label>` : `<label class="ldc-field"><span class="ldc-label">Aliases <span class="ldc-hint">Comma-separated</span></span><input class="ldc-input" data-role="aliases" value="${esc(aliases)}" placeholder="Hugo, Mr. Vlad, narrator"></label>`}</details></div><div class="ldc-savebar"><span data-save-status="${saveStatus}">${saveStatus === 'saving' ? 'Saving changes…' : saveStatus === 'pending' ? 'Changes waiting…' : saveStatus === 'error' ? 'Could not save changes' : 'Changes saved automatically'}</span>${isPersona ? '' : `<button class="ldc-btn" data-action="remove-character">Remove from scene</button>`}</div>`;
    }
    function diagnosticsText() { const d = state?.diagnostics || {}, last = d.lastHydration || state?.config?.lastHydration || null, messageSuffix = last?.messageId ? String(last.messageId).slice(-8) : 'none'; return [`Prism ${d.prismVersion || '1.0.0'}`, `Engine: ${engineLabel(state?.config?.engine)}`, `Config schema: ${d.configSchema || state?.config?.version || 'unknown'}`, `Registry revision: ${d.registryRevision || state?.registry?.revision || 'none'}`, `Confirmed speakers: ${d.confirmedSpeakers ?? state?.registry?.entries?.length ?? 0}`, `Registry collisions: ${d.registryCollisions ?? state?.registry?.conflicts?.length ?? 0}`, `Registry entries omitted by budget: ${d.registryTrimmed || 0}`, `Tentative groups: ${d.tentativeGroups ?? pendingReviewCount}`, `Unresolved rendered segments: ${unresolvedSegments().length}`, `Cortex entities: ${d.cortexEntities || 'unknown'}`, `Cortex macro: ${d.cortexMacro || 'unknown'}`, `Last hydration: ${last?.status || 'none'}`, `Last hydration message: …${messageSuffix}`, `Toolbar mounted: ${document.querySelector('[data-prism-toolbar-button]') ? 'yes' : 'no'}`, `DOM helpers: ${ctx.dom?.listMessageElements && ctx.dom?.inject ? 'healthy' : 'unavailable'}`, `Frontend/backend roundtrip: ${lastRoundtripMs ? `${lastRoundtripMs} ms` : 'not measured'}`, `Last backend error: ${lastBackendError || 'none'}`].join('\n'); }
    function registryExportText() { return JSON.stringify({ format: 'prism-registry', version: 1, exportedAt: new Date().toISOString(), entries: (state?.registry?.entries || []).map(entry => ({ speakerUid: entry.speakerUid, kind: entry.kind, name: entry.name, aliases: entry.aliases, color: entry.color })) }, null, 2); }
    async function copyText(value) { if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    } const area = document.createElement('textarea'); area.value = value; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); }
    function openRegistryImport() {
        importModal?.dismiss();
        importModal = ctx.ui.showModal({ title: 'Import Prism registry', width: 560, maxHeight: 560 });
        importModal.onDismiss(() => { importModal = null; });
        importModal.root.innerHTML = `<div class="ldc-registry-import"><div><strong>Paste a Prism registry export</strong><div class="ldc-sub">Imports up to 48 confirmed entries. Existing stable speakers are merged; duplicate colors are reported instead of silently accepted.</div></div><textarea data-registry-json spellcheck="false" placeholder='{ "format": "prism-registry", "entries": [...] }'></textarea><div class="ldc-registry-import-actions"><button class="ldc-btn" data-action="cancel-import">Cancel</button><button class="ldc-btn ldc-primary" data-action="apply-import">Import registry</button></div></div>`;
        importModal.root.querySelector('[data-action=cancel-import]')?.addEventListener('click', () => importModal?.dismiss());
        importModal.root.querySelector('[data-action=apply-import]')?.addEventListener('click', () => perform(async () => { const text = importModal?.root.querySelector('[data-registry-json]')?.value || ''; let parsed; try {
            parsed = JSON.parse(text);
        }
        catch {
            throw new Error('That is not valid JSON.');
        } if (parsed?.format !== 'prism-registry' || !Array.isArray(parsed.entries))
            throw new Error('Choose a Prism registry export containing an entries array.'); const result = await request('ldc_import_registry', { chatId: state.chat.id, entries: parsed.entries }, 60000); importModal?.dismiss(); acceptState(result.state); if (modal)
            render(); await ctx.ui.showConfirm({ title: 'Registry imported', message: `Imported ${result.imported} entr${result.imported === 1 ? 'y' : 'ies'}.${result.conflicts?.length ? ` ${result.conflicts.length} color collision${result.conflicts.length === 1 ? ' was' : 's were'} skipped.` : ''}`, confirmLabel: 'Okay', cancelLabel: 'Close', variant: result.conflicts?.length ? 'warning' : 'success' }); }));
    }
    async function runTranscriptMutation(mode) { const personaMode = mode === 'persona-history', previewType = personaMode ? 'ldc_persona_history_preview' : 'ldc_normalize_preview', applyType = personaMode ? 'ldc_persona_history_apply' : 'ldc_normalize_apply', preview = await request(previewType, { chatId: state.chat.id }, 60000), summary = personaMode ? `${preview.userMessages} historical user message${preview.userMessages === 1 ? '' : 's'} would receive the current persona mode.` : `${preview.assistantMessages} assistant and ${preview.userMessages} user message${preview.assistantMessages + preview.userMessages === 1 ? '' : 's'} contain replaceable legacy tags.${preview.ambiguousSharedColors ? ` ${preview.ambiguousSharedColors} ambiguous shared color${preview.ambiguousSharedColors === 1 ? ' is' : 's are'} skipped.` : ''}`, title = personaMode ? 'Apply persona colors historically?' : 'Normalize existing font tags?'; const { confirmed } = await ctx.ui.showConfirm({ title, message: `Dry run complete. ${summary} Prism stores a recovery backup before changing anything.`, confirmLabel: preview.changed ? `Apply ${preview.changed} change${preview.changed === 1 ? '' : 's'}` : 'Nothing to change', cancelLabel: 'Cancel', variant: preview.changed ? 'danger' : 'warning' }); if (!confirmed || !preview.changed)
        return; setSaveStatus('saving'); const result = await request(applyType, { chatId: state.chat.id }, 120000); setSaveStatus('saved'); for (const { messageId } of ctx.dom.listMessageElements())
        dirty.add(messageId); schedule(true); await ctx.ui.showConfirm({ title: 'Transcript update complete', message: `Updated ${result.changed} message${result.changed === 1 ? '' : 's'}. A recovery backup is available from Prism settings.`, confirmLabel: 'Okay', cancelLabel: 'Close', variant: 'success' }); }
    function settingsPanel() { const p = state?.preferences || {}, last = state?.config?.lastHydration; return `<section class="ldc-settings"><div class="ldc-heading ldc-settings-heading"><div><h3>Paint and attribution</h3><div class="ldc-sub">Existing font tags stay authoritative. Local and Hybrid modes fill only missing regions.</div></div></div><div class="ldc-settings-grid"><div class="ldc-card ldc-settings-card"><h4>Attribution mode</h4><p>Balanced uses labels, speech tags, action beats, continuity, legacy colors, and bubble authors.</p><div class="ldc-card-controls"><select class="ldc-select" data-role="mode"><option value="strict" ${p.domAttributionMode === 'strict' ? 'selected' : ''}>Strict</option><option value="balanced" ${p.domAttributionMode === 'balanced' ? 'selected' : ''}>Balanced</option><option value="aggressive" ${p.domAttributionMode === 'aggressive' ? 'selected' : ''}>Aggressive</option></select><label class="ldc-setting-check"><input type="checkbox" data-role="uncertain" ${p.markUncertain !== false ? 'checked' : ''}> <span>Mark uncertain dialogue</span></label></div></div><div class="ldc-card ldc-settings-card"><h4>Existing formatting</h4><p>Tags are never rewritten during rendering. Matched colors can teach turns and receive reversible local paint.</p><div class="ldc-card-controls"><select class="ldc-select" data-role="legacy-policy"><option value="preserve" ${p.existingStylePolicy === 'preserve' ? 'selected' : ''}>Preserve exactly</option><option value="enhance" ${p.existingStylePolicy === 'enhance' ? 'selected' : ''}>Enhance matched tags</option><option value="replace" ${p.existingStylePolicy === 'replace' ? 'selected' : ''}>Replace visually</option></select><label class="ldc-setting-check"><input type="checkbox" data-role="legacy-evidence" ${p.useExistingAsEvidence !== false ? 'checked' : ''}> <span>Use matched tags as speaker evidence</span></label></div></div><div class="ldc-card ldc-settings-card"><h4>Thought detection</h4><p>Opt-in because roleplay italics and single quotes are gloriously ambiguous.</p><div class="ldc-card-controls"><select class="ldc-select" data-role="thought-detection"><option value="off" ${p.thoughtDetection === 'off' ? 'selected' : ''}>Off</option><option value="italics" ${p.thoughtDetection === 'italics' ? 'selected' : ''}>Italics</option><option value="single-quotes" ${p.thoughtDetection === 'single-quotes' ? 'selected' : ''}>Single quotes</option><option value="italics-and-single-quotes" ${p.thoughtDetection === 'italics-and-single-quotes' ? 'selected' : ''}>Italics + single quotes</option></select><label class="ldc-setting-check"><input type="checkbox" data-role="prompt-thoughts" ${state.config.promptThoughtColors === true ? 'checked' : ''}> <span>Ask LLM sidecar to mark thoughts</span></label></div></div><div class="ldc-card ldc-settings-card ldc-settings-card-wide"><h4>Hybrid NPC discovery</h4><p>Strong explicit evidence may create one provisional hint; weaker discoveries require two independent sightings. Model echoes never increase confidence, and stale hints expire.</p><div class="ldc-card-controls"><label class="ldc-setting-check"><input type="checkbox" data-role="hybrid-discovery" ${state.config.hybridDiscovery !== false ? 'checked' : ''}> <span>Color and rehydrate new speakers in Hybrid mode</span></label></div></div><div class="ldc-card ldc-settings-card"><h4>Normalize existing font tags</h4><p>Dry-runs first, changes only matching legacy tags, skips ambiguous shared colors, and stores a rollback backup. It never adds persona markup.</p><div class="ldc-card-controls ldc-card-controls-action"><button class="ldc-btn" data-action="normalize-tags">Preview normalization</button></div></div><div class="ldc-card ldc-settings-card"><h4>Historical persona colors</h4><p>Separate opt-in operation for applying the current persona mode to older user messages. A recovery backup is stored before mutation.</p><div class="ldc-card-controls ldc-card-controls-action"><button class="ldc-btn" data-action="persona-history">Preview persona changes</button><button class="ldc-btn" data-action="restore-transcript">Restore last backup</button></div></div><div class="ldc-card ldc-settings-card"><h4>Hybrid repair</h4><p>Retry delayed storage, rescan only the current message, or clear tentative evidence without touching confirmed colors.</p><div class="ldc-card-controls ldc-card-controls-action"><button class="ldc-btn" data-action="retry-hydration" ${last?.messageId ? '' : 'disabled'}>Retry last hydration</button><button class="ldc-btn" data-action="rescan-current">Rescan current message</button><button class="ldc-btn" data-action="reset-temporary">Reset temporary evidence</button></div></div><div class="ldc-card ldc-settings-card ldc-settings-card-wide"><h4>Compatibility and registry</h4><p>Diagnostics and exports never contain message text. Imports preserve stable speakers and stop on color collisions.</p><div class="ldc-card-controls ldc-card-controls-action"><button class="ldc-btn" data-action="copy-diagnostics">Copy diagnostics</button><button class="ldc-btn" data-action="copy-registry">Copy registry JSON</button><button class="ldc-btn" data-action="import-registry">Import registry JSON</button></div></div></div></section>`; }
    function render() {
        if (!modal)
            return;
        const oldSide = modal.root.querySelector('.ldc-side'), oldPanel = modal.root.querySelector('.ldc-panel');
        if (oldSide && activeTab === 'character')
            sideScroll = oldSide.scrollTop;
        if (oldPanel)
            panelScroll = oldPanel.scrollTop;
        if (!state) {
            modal.root.innerHTML = '<div class="ldc-loading">Reading the scene registry…</div>';
            return;
        }
        if (!state.ok) {
            modal.root.innerHTML = `<div class="ldc-error">${esc(state.error || 'Could not load this chat.')}</div>`;
            return;
        }
        if (!selectedId && state.characters?.length)
            selectedId = state.characters[0].id;
        const missing = missingCount(), engine = normalizeEngine(state.config.engine), needs = missing > 0;
        const setupTitle = `Set up scene colors · ${missing} scene member${missing === 1 ? '' : 's'} still need colors`;
        const unresolved = unresolvedSegments().length, collisionCount = state.registry?.conflicts?.length || 0;
        modal.root.innerHTML = `<div class="ldc-shell"><div class="ldc-top"><div class="ldc-tabs"><button class="ldc-tab" data-tab="character" data-active="${activeTab === 'character' && !settingsOpen && !reviewOpen}">Characters</button><button class="ldc-tab" data-tab="persona" data-active="${activeTab === 'persona' && !settingsOpen && !reviewOpen}">Persona</button></div><div class="ldc-top-actions"><span class="ldc-engine-copy">${esc(engineDescription(engine))}</span>${collisionCount ? `<button class="ldc-review ldc-registry-warning" data-action="settings" title="Conflicting speakers are quarantined from Hybrid injection">${collisionCount} color collision${collisionCount === 1 ? '' : 's'}</button>` : ''}${pendingReviewCount ? `<button class="ldc-review" data-action="review-hydration">${pendingReviewCount} awaiting review</button>` : ''}${unresolved ? `<button class="ldc-review" data-action="review-unresolved">${unresolved} unresolved · Review</button>` : ''}<div class="ldc-engine"><button data-engine="dom" data-active="${engine === 'dom'}" title="Render-only heuristic coloring">Local</button><button data-engine="hybrid" data-active="${engine === 'hybrid'}" title="Persist model font tags, then fill untagged gaps locally">Hybrid</button><button data-engine="llm" data-active="${engine === 'llm'}" title="Use only model-emitted font tags">LLM</button></div><button class="ldc-icon" data-action="settings" data-active="${settingsOpen}" title="Prism settings">${GEAR_ICON}</button></div></div>${needs ? `<div class="ldc-setup"><div class="ldc-setup-copy"><span class="ldc-setup-icon">${SPARK_ICON}</span><div><div class="ldc-setup-title">${esc(setupTitle)}</div><div class="ldc-setup-desc">Found ${state.characters.length} characters${state.persona ? ' and your active persona' : ''}. Existing imported and manual colors stay untouched.</div></div></div><button class="ldc-mini" data-action="setup">Set up scene</button></div>` : ''}<div class="ldc-main-wrap"><div class="ldc-main">${activeTab === 'character' ? `<aside class="ldc-side">${sidebar()}</aside><section class="ldc-panel">${charPanel(current())}</section>` : `<aside class="ldc-side"><div class="ldc-side-label">Active persona</div><div class="ldc-person" data-active="true"><span class="ldc-avatar">${esc(initials(state.persona?.name))}</span><span class="ldc-person-copy"><span class="ldc-person-name">${esc(state.persona?.name || 'No persona')}</span><span class="ldc-person-source">${state.config.personaEnabled === false ? 'disabled' : 'currently applied'}</span></span></div></aside><section class="ldc-panel">${personaPanel()}</section>`}</div>${reviewOpen ? reviewPanel() : settingsOpen ? settingsPanel() : ''}</div><div class="ldc-status"><span>${esc(state.chat.name)}</span><span class="ldc-bridge">${engineLabel(engine)} · ${state.characters.length} characters · Cortex ${state.cortexAvailable ? 'linked' : 'unavailable'}</span></div></div>`;
        if (settingsOpen) {
            const grid = modal.root.querySelector('.ldc-settings-grid');
            if (grid)
                grid.insertAdjacentHTML('afterbegin', registryHealthCard() + cortexHealthCard());
        }
        const bridge = modal.root.querySelector('.ldc-bridge');
        if (bridge)
            bridge.textContent = `${engineLabel(engine)} · ${state.characters.length} characters · ${cortexSummary()}`;
        wire();
        const next = modal.root.querySelector('.ldc-side'), nextPanel = modal.root.querySelector('.ldc-panel');
        if (next && activeTab === 'character')
            next.scrollTop = sideScroll;
        if (nextPanel)
            nextPanel.scrollTop = panelScroll;
        setSaveStatus(saveStatus);
        setBusy(busy);
    }
    async function saveBinding(kind, target, color, aliases = [], channels = null, rerender = true) { const response = await request('ldc_save_binding', { chatId: state.chat.id, kind, targetId: kind === 'persona' ? target.id : (target.entityId || target.characterId || target.id), name: target.name, aliases, color, channels, engine: state.config.engine, autoUserMode: state.config.autoUserMode }); acceptState(response.state); if (kind === 'character' && rerender)
        selectedId = state.characters.find(x => x.name === target.name)?.id || selectedId; if (rerender)
        render(); }
    function openAddPerson(seedColor = null) {
        const detected = normalizeHex(seedColor);
        if (addModal) {
            addModal.dismiss();
            addModal = null;
        }
        addModal = ctx.ui.showModal({ title: 'Add scene character', width: 390, maxHeight: 360 });
        addModal.onDismiss(() => { addModal = null; });
        addModal.root.innerHTML = `<section class="ldc-add-person"><div class="ldc-heading"><div><h3>Add character manually</h3><div class="ldc-sub">Useful when a card, group bubble, or narrator label does not describe the actual speaker.${detected ? ` The detected ${detected} color will be bound to them.` : ''}</div></div></div><label class="ldc-field"><span class="ldc-label">Name</span><input class="ldc-input" data-add-role="name" maxlength="80" placeholder="Lycaon"></label><label class="ldc-field"><span class="ldc-label">Aliases <span class="ldc-hint">Comma-separated; bubble labels work here too</span></span><input class="ldc-input" data-add-role="aliases" placeholder="Von Lycaon, narrator"></label><div class="ldc-actions"><span class="ldc-autosave">Only affects this chat roster</span><button class="ldc-btn ldc-primary" data-action="confirm-add">Add character</button></div></section>`;
        const nameInput = addModal.root.querySelector('[data-add-role=name]'), button = addModal.root.querySelector('[data-action=confirm-add]');
        nameInput?.focus();
        const submit = async () => { const name = String(nameInput?.value || '').trim(), aliases = String(addModal?.root.querySelector('[data-add-role=aliases]')?.value || '').split(',').map(x => x.trim()).filter(Boolean); if (!name)
            return; button.disabled = true; try {
            let response = await request('ldc_add_character', { chatId: state.chat.id, name, aliases });
            acceptState(response.state);
            let added = state.characters.find(x => x.name.toLowerCase() === name.toLowerCase());
            if (detected && added) {
                response = await request('ldc_save_binding', { chatId: state.chat.id, kind: 'character', targetId: added.entityId || added.characterId || added.id, name: added.name, aliases, color: detected, channels: safeChannels({ color: detected }), engine: state.config.engine, autoUserMode: state.config.autoUserMode });
                acceptState(response.state);
                added = state.characters.find(x => x.name.toLowerCase() === name.toLowerCase());
            }
            selectedId = added?.id || selectedId;
            addModal?.dismiss();
            addModal = null;
            render();
        }
        catch (error) {
            button.disabled = false;
            await ctx.ui.showConfirm({ title: 'Could not add character', message: error?.message || String(error), confirmLabel: 'Okay', cancelLabel: 'Close', variant: 'warning' });
        } };
        button.onclick = submit;
        nameInput.onkeydown = e => { if (e.key === 'Enter')
            submit(); };
    }
    async function removeCurrent() { const character = current(); if (!character)
        return; const { confirmed } = await ctx.ui.showConfirm({ title: `Remove ${character.name}?`, message: 'Prism will hide this discovered entry in this chat. Its saved color is kept in case you add it again.', confirmLabel: 'Remove', cancelLabel: 'Keep', variant: 'warning' }); if (!confirmed)
        return; await perform(async () => { const response = await request('ldc_remove_character', { chatId: state.chat.id, characterId: character.id, name: character.name }); acceptState(response.state); selectedId = state.characters?.[0]?.id || null; render(); }); }
    function readEditorChannels(target) { const channels = safeChannels(target?.binding), stop1 = normalizeHex(modal?.root.querySelector('[data-role=hex]')?.value), mode = modal?.root.querySelector('[data-role=paint-mode]')?.value === 'gradient' ? 'gradient' : 'solid', count = mode === 'gradient' ? (Number(modal?.root.querySelector('[data-role=stop-count]')?.value) || 3) : 1, stop2 = normalizeHex(modal?.root.querySelector('[data-role=hex-2]')?.value) || (stop1 && mode === 'gradient' ? harmonicColor(stop1) : null), stop3 = normalizeHex(modal?.root.querySelector('[data-role=hex-3]')?.value) || stop1, angle = Math.max(0, Math.min(360, Number(modal?.root.querySelector('[data-role=angle]')?.value) || 90)), stops = mode === 'gradient' ? (count === 3 ? [stop1, stop2, stop3] : [stop1, stop2]).filter(Boolean) : [stop1]; if (!stop1)
        return null; if (activeChannel === 'thought') {
        const canonical = normalizeHex(channels.dialogue.paint.stops[0]) || normalizeHex(target?.binding?.color) || '#B58CFF', editedPaint = safePaint({ mode, stops, angle, anchor: canonical }, canonical), enabled = modal?.root.querySelector('[data-role=channel-enabled]')?.checked !== false, toggle = modal?.root.querySelector('[data-role=thought-linked]'), linked = toggle ? toggle.checked : channels.thought.linkedToDialogue !== false;
        channels.thought = { enabled, linkedToDialogue: linked, paint: linked ? safePaint(channels.dialogue.paint, canonical) : editedPaint };
        channels.dialogue.paint.stops[0] = canonical;
        channels.dialogue.paint.anchor = canonical;
        channels.thought.paint.anchor = canonical;
        return { channels, color: canonical };
    } const canonical = stop1, editedPaint = safePaint({ mode, stops, angle, anchor: canonical }, canonical), enabled = modal?.root.querySelector('[data-role=channel-enabled]')?.checked !== false; editedPaint.stops[0] = canonical; editedPaint.anchor = canonical; channels.dialogue = { enabled, paint: editedPaint }; if (channels.thought.linkedToDialogue !== false)
        channels.thought = { ...channels.thought, linkedToDialogue: true, paint: safePaint(editedPaint, canonical) }; channels.thought.paint.anchor = canonical; return { channels, color: canonical }; }
    async function saveEditor(kind, rerender = false) { if (!modal)
        return; const target = kind === 'persona' ? state.persona : current(); if (!target)
        return; const read = readEditorChannels(target); if (!read)
        throw new Error('Enter valid six-digit hex colors.'); const aliases = kind === 'character' ? String(modal.root.querySelector('[data-role=aliases]')?.value || '').split(',').map(x => x.trim()).filter(Boolean) : []; await saveBinding(kind, target, read.color, aliases, read.channels, rerender); }
    function syncSidebarSwatch(target, paint) { if (!modal || !target)
        return; const p = safePaint(paint, target?.binding?.color), swatch = modal.root.querySelector(`[data-inline-swatch="${CSS.escape(String(target.id))}"]`), picker = modal.root.querySelector(`[data-inline-color="${CSS.escape(String(target.id))}"]`); if (swatch) {
        swatch.style.setProperty('--swatch', p.stops[0]);
        swatch.style.setProperty('--swatch-paint', paintBackground(p, p.stops[0]));
    } if (picker)
        picker.value = p.stops[0]; }
    function markThoughtCustomized() { if (activeChannel !== 'thought' || !modal)
        return; const toggle = modal.root.querySelector('[data-role=thought-linked]'); if (toggle?.checked) {
        toggle.checked = false;
        const controls = modal.root.querySelector('.ldc-editor-controls');
        if (controls)
            controls.dataset.thoughtLinked = 'false';
        const copy = modal.root.querySelector('.ldc-thought-link span:last-child');
        if (copy)
            copy.textContent = 'Custom thought paint';
    } }
    function updateEditorPreview() { if (!modal)
        return; const target = activeTab === 'persona' ? state?.persona : current(), read = readEditorChannels(target); if (!read)
        return; const lines = { dialogue: modal.root.querySelector('.ldc-preview-dialogue'), thought: modal.root.querySelector('.ldc-preview-thought') }; for (const kind of ['dialogue', 'thought']) {
        const line = lines[kind], paint = read.channels[kind].paint, gradient = paint.mode === 'gradient' && paint.stops.length >= 2, value = gradient ? `linear-gradient(${paint.angle}deg,${paint.stops.join(', ')})` : paint.stops[0];
        if (line) {
            line.dataset.prismPaint = gradient ? 'gradient' : 'solid';
            line.style.setProperty('--ldc-fallback', paint.anchor);
            line.style.setProperty('--ldc-color', paint.stops[0]);
            if (gradient) {
                line.style.removeProperty('color');
                line.style.setProperty('--ldc-gradient', value);
            }
            else {
                line.style.removeProperty('--ldc-gradient');
                line.style.setProperty('color', paint.stops[0], 'important');
            }
        }
    } const paint = read.channels[activeChannel].paint, gradient = paint.mode === 'gradient' && paint.stops.length >= 2, value = gradient ? `linear-gradient(${paint.angle}deg,${paint.stops.join(', ')})` : paint.stops[0], editor = modal.root.querySelector('.ldc-gradient-editor'); if (editor) {
        editor.style.setProperty('--editor-gradient', value);
        editor.style.setProperty('--editor-solid', paint.stops[0]);
    } modal.root.querySelectorAll('.ldc-stop span').forEach((stop, index) => stop.style.setProperty('--stop', paint.stops[index] || paint.stops[0])); syncSidebarSwatch(target, read.channels.dialogue.paint); const canonicalReadout = modal.root.querySelector('[data-role=canonical-readout]'); if (canonicalReadout)
        canonicalReadout.value = read.color; }
    function queueEditorSave(immediate = false) { clearTimeout(saveTimer); const generation = ++saveGeneration; setSaveStatus('pending'); saveTimer = setTimeout(() => { saveQueue = saveQueue.catch(() => { }).then(async () => { if (generation !== saveGeneration)
        return; setSaveStatus('saving'); try {
        await saveEditor(activeTab === 'persona' ? 'persona' : 'character', false);
        if (generation === saveGeneration)
            setSaveStatus('saved');
    }
    catch (error) {
        if (generation === saveGeneration)
            setSaveStatus('error');
        await ctx.ui.showConfirm({ title: 'Prism', message: error?.message || String(error), confirmLabel: 'Okay', cancelLabel: 'Close', variant: 'warning' });
    } }); }, immediate ? 0 : 450); }
    function navigateEditor(action) { clearTimeout(saveTimer); const pendingSave = saveStatus === 'pending'; ++saveGeneration; if (pendingSave)
        perform(async () => { setSaveStatus('saving'); await saveQueue.catch(() => { }); await saveEditor(activeTab === 'persona' ? 'persona' : 'character', false); action(); saveStatus = 'saved'; render(); });
    else {
        action();
        saveStatus = 'saved';
        render();
    } }
    function unresolvedSegments() { return [...new Set(document.querySelectorAll('.ldc-prism-segment[data-prism-kind="dialogue"][data-prism-speaker=""],.ldc-prism-segment[data-prism-kind="dialogue"][data-prism-needs-color=true],.ldc-prism-segment[data-prism-kind="dialogue"][data-prism-hybrid-deferred=true]'))].filter(element => element.isConnected); }
    function reviewUnresolved() { const segments = unresolvedSegments(); if (!segments.length)
        return; const target = segments[reviewIndex % segments.length]; reviewIndex = (reviewIndex + 1) % segments.length; modal?.dismiss(); modal = null; target.scrollIntoView({ behavior: 'smooth', block: 'center' }); target.focus({ preventScroll: true }); target.classList.add('ldc-prism-reviewing'); setTimeout(() => target.classList.remove('ldc-prism-reviewing'), 1800); }
    function channelsForDialogueColor(binding, color) { const channels = safeChannels(binding), paint = safePaint({ mode: 'solid', stops: [color], angle: 90, anchor: color }, color); channels.dialogue = { ...channels.dialogue, enabled: true, paint }; if (channels.thought.linkedToDialogue !== false)
        channels.thought = { ...channels.thought, linkedToDialogue: true, paint: safePaint(paint, color) };
    else
        channels.thought.paint.anchor = color; return channels; }
    function wire() {
        if (!modal)
            return;
        const openReview = () => { reviewOpen = true; settingsOpen = false; render(); };
        modal.root.querySelectorAll('[data-action=review-hydration]').forEach(button => button.addEventListener('click', openReview));
        modal.root.querySelector('[data-action=close-review]')?.addEventListener('click', () => { reviewOpen = false; render(); });
        modal.root.querySelectorAll('[data-review-role=merge]').forEach(select => select.addEventListener('change', () => { const binding = reviewBinding(select.value), card = select.closest('[data-observation-group]'); if (!binding || !card)
            return; const name = card.querySelector('[data-review-role=name]'), color = card.querySelector('[data-review-role=color]'); if (name)
            name.value = binding.name; if (color)
            color.value = bindingRegistryColor(binding) || color.value; }));
        modal.root.querySelectorAll('[data-review-action]').forEach(button => button.addEventListener('click', () => perform(async () => { const card = button.closest('[data-observation-group]'), groupKey = card?.dataset.observationGroup; if (!groupKey)
            return; const action = button.dataset.reviewAction, payload = { chatId: state.chat.id, groupKey, action }; if (action === 'approve') {
            payload.name = String(card.querySelector('[data-review-role=name]')?.value || '').trim();
            payload.color = String(card.querySelector('[data-review-role=color]')?.value || '').trim();
            payload.mergeSpeakerUid = String(card.querySelector('[data-review-role=merge]')?.value || '') || null;
        } setHydrationStatus('syncing'); const response = await request('ldc_review_observation', payload, 30000); acceptState(response.state); setHydrationStatus(response.pendingCount > 0 ? 'awaiting' : 'idle'); if (!response.pendingCount)
            reviewOpen = false; render(); })));
        modal.root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => navigateEditor(() => { activeTab = b.dataset.tab; settingsOpen = false; reviewOpen = false; }));
        modal.root.querySelectorAll('[data-channel]').forEach(b => b.onclick = () => { if (b.dataset.channel === activeChannel)
            return; clearTimeout(saveTimer); perform(async () => { setSaveStatus('saving'); await saveEditor(activeTab === 'persona' ? 'persona' : 'character'); activeChannel = b.dataset.channel; saveStatus = 'saved'; render(); }); });
        modal.root.querySelectorAll('[data-character-id]').forEach(row => { const activate = e => { if (e.target.closest('input,[data-inline-swatch]'))
            return; const side = modal.root.querySelector('.ldc-side'); if (side)
            sideScroll = side.scrollTop; navigateEditor(() => { selectedId = row.dataset.characterId; }); }; row.onclick = activate; row.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ')
            activate(e); }; });
        modal.root.querySelectorAll('[data-action=settings]').forEach(button => button.addEventListener('click', () => navigateEditor(() => { reviewOpen = false; settingsOpen = button.classList.contains('ldc-icon') ? !settingsOpen : true; })));
        for (const [action, type] of [['cortex-sync', 'ldc_cortex_sync'], ['cortex-repair', 'ldc_cortex_repair']])
            modal.root.querySelector(`[data-action=${action}]`)?.addEventListener('click', () => perform(async () => { setSaveStatus('saving'); const response = await request(type, { chatId: state.chat.id }, 60000); acceptState(response.state); setSaveStatus('saved'); render(); }));
        modal.root.querySelector('[data-action=review-unresolved]')?.addEventListener('click', reviewUnresolved);
        modal.root.querySelector('[data-action=health-review]')?.addEventListener('click', reviewUnresolved);
        modal.root.querySelector('[data-action=add-person]')?.addEventListener('click', openAddPerson);
        modal.root.querySelector('[data-action=remove-character]')?.addEventListener('click', removeCurrent);
        modal.root.querySelectorAll('[data-engine]').forEach(b => b.onclick = () => perform(async () => { if (b.dataset.engine === state.config.engine)
            return; const r = await request('ldc_update_options', { engine: b.dataset.engine, autoUserMode: state.config.autoUserMode }); acceptState(r.state); render(); }));
        for (const [action, regenerate] of [['setup', false], ['assign', false], ['regenerate', true]])
            modal.root.querySelectorAll(`[data-action=${action}]`).forEach(button => button.addEventListener('click', () => perform(async () => { const r = await request(action === 'setup' ? 'ldc_setup_scene' : 'ldc_assign_colors', { chatId: state.chat.id, regenerate, surfaceColor: messageSurfaceColor() }, 60000); acceptState(r.state); render(); })));
        modal.root.querySelectorAll('[data-inline-color]').forEach(p => { p.onclick = e => e.stopPropagation(); p.oninput = () => { const color = normalizeHex(p.value), swatch = p.closest('[data-inline-swatch]'); if (color && swatch) {
            swatch.style.setProperty('--swatch', color);
            swatch.style.setProperty('--swatch-paint', color);
        } }; p.onchange = () => { const c = state.characters.find(x => String(x.id) === String(p.dataset.inlineColor)), color = normalizeHex(p.value); if (c && color)
            perform(async () => { setSaveStatus('saving'); try {
                await saveBinding('character', c, color, c.binding?.aliases || c.aliases || [], channelsForDialogueColor(c.binding, color));
                setSaveStatus('saved');
                render();
            }
            catch (error) {
                setSaveStatus('error');
                throw error;
            } }); }; });
        for (const suffix of ['', '-2', '-3']) {
            const picker = modal.root.querySelector(`[data-role=picker${suffix}]`), hex = modal.root.querySelector(`[data-role=hex${suffix}]`);
            if (picker && hex) {
                picker.oninput = () => { markThoughtCustomized(); hex.value = picker.value.toUpperCase(); updateEditorPreview(); queueEditorSave(); };
                picker.onchange = () => { markThoughtCustomized(); queueEditorSave(true); };
                hex.oninput = () => { const color = normalizeHex(hex.value); if (color) {
                    markThoughtCustomized();
                    picker.value = color;
                    updateEditorPreview();
                    queueEditorSave();
                } };
                hex.onblur = () => { const color = normalizeHex(hex.value); if (color) {
                    hex.value = color;
                    updateEditorPreview();
                    queueEditorSave(true);
                } };
            }
        }
        modal.root.querySelector('[data-role=paint-mode]')?.addEventListener('change', () => { markThoughtCustomized(); clearTimeout(saveTimer); ++saveGeneration; perform(async () => { setSaveStatus('saving'); await saveQueue.catch(() => { }); await saveEditor(activeTab === 'persona' ? 'persona' : 'character', false); saveStatus = 'saved'; render(); }); });
        modal.root.querySelector('[data-role=stop-count]')?.addEventListener('change', () => { markThoughtCustomized(); clearTimeout(saveTimer); ++saveGeneration; perform(async () => { setSaveStatus('saving'); await saveQueue.catch(() => { }); await saveEditor(activeTab === 'persona' ? 'persona' : 'character', false); saveStatus = 'saved'; render(); }); });
        modal.root.querySelector('[data-role=channel-enabled]')?.addEventListener('change', () => queueEditorSave(true));
        modal.root.querySelector('[data-role=thought-linked]')?.addEventListener('change', () => { clearTimeout(saveTimer); ++saveGeneration; perform(async () => { setSaveStatus('saving'); await saveQueue.catch(() => { }); await saveEditor(activeTab === 'persona' ? 'persona' : 'character', false); saveStatus = 'saved'; render(); }); });
        for (const role of ['angle', 'aliases']) {
            const input = modal.root.querySelector(`[data-role=${role}]`);
            if (input) {
                input.addEventListener('input', () => { if (role === 'angle')
                    markThoughtCustomized(); if (role === 'angle')
                    updateEditorPreview(); queueEditorSave(); });
                input.addEventListener('blur', () => queueEditorSave(true));
            }
        }
        modal.root.querySelector('[data-action=swap-colors]')?.addEventListener('click', () => { markThoughtCustomized(); const angle = modal.root.querySelector('[data-role=angle]'); if (!angle)
            return; angle.value = String((Math.max(0, Math.min(360, Number(angle.value) || 90)) + 180) % 360); updateEditorPreview(); queueEditorSave(true); });
        modal.root.querySelector('[data-role=persona-enabled]')?.addEventListener('change', e => perform(async () => { const r = await request('ldc_update_options', { engine: state.config.engine, personaEnabled: e.target.checked }); acceptState(r.state); render(); }));
        modal.root.querySelector('[data-role=auto-mode]')?.addEventListener('change', e => perform(async () => { const r = await request('ldc_update_options', { engine: state.config.engine, autoUserMode: e.target.value }); acceptState(r.state); render(); }));
        modal.root.querySelector('[data-role=mode]')?.addEventListener('change', e => perform(async () => { const r = await request('ldc_update_options', { engine: state.config.engine, domAttributionMode: e.target.value }); acceptState(r.state); render(); }));
        modal.root.querySelector('[data-role=uncertain]')?.addEventListener('change', e => perform(async () => { const r = await request('ldc_update_options', { engine: state.config.engine, markUncertain: e.target.checked }); acceptState(r.state); render(); }));
        for (const [role, key] of [['legacy-policy', 'existingStylePolicy'], ['thought-detection', 'thoughtDetection']])
            modal.root.querySelector(`[data-role=${role}]`)?.addEventListener('change', e => perform(async () => { const r = await request('ldc_update_options', { engine: state.config.engine, [key]: e.target.value }); acceptState(r.state); render(); }));
        modal.root.querySelector('[data-role=legacy-evidence]')?.addEventListener('change', e => perform(async () => { const r = await request('ldc_update_options', { engine: state.config.engine, useExistingAsEvidence: e.target.checked }); acceptState(r.state); render(); }));
        modal.root.querySelector('[data-role=prompt-thoughts]')?.addEventListener('change', e => perform(async () => { const r = await request('ldc_update_options', { engine: state.config.engine, promptThoughtColors: e.target.checked }); acceptState(r.state); render(); }));
        modal.root.querySelector('[data-role=hybrid-discovery]')?.addEventListener('change', e => perform(async () => { const r = await request('ldc_update_options', { engine: state.config.engine, hybridDiscovery: e.target.checked }); acceptState(r.state); render(); }));
        modal.root.querySelector('[data-action=normalize-tags]')?.addEventListener('click', () => perform(() => runTranscriptMutation('normalize')));
        modal.root.querySelector('[data-action=persona-history]')?.addEventListener('click', () => perform(() => runTranscriptMutation('persona-history')));
        modal.root.querySelector('[data-action=restore-transcript]')?.addEventListener('click', async () => { const { confirmed } = await ctx.ui.showConfirm({ title: 'Restore last Prism transcript backup?', message: 'This restores every message captured before the most recent Prism transcript operation.', confirmLabel: 'Restore backup', cancelLabel: 'Cancel', variant: 'danger' }); if (!confirmed)
            return; await perform(async () => { setSaveStatus('saving'); const result = await request('ldc_restore_transcript', { chatId: state.chat.id }, 120000); setSaveStatus('saved'); for (const { messageId } of ctx.dom.listMessageElements())
            dirty.add(messageId); schedule(true); await ctx.ui.showConfirm({ title: 'Backup restored', message: `Restored ${result.restored} message${result.restored === 1 ? '' : 's'}.`, confirmLabel: 'Okay', cancelLabel: 'Close', variant: 'success' }); }); });
        modal.root.querySelector('[data-action=copy-diagnostics]')?.addEventListener('click', () => perform(async () => { await copyText(diagnosticsText()); const button = modal?.root.querySelector('[data-action=copy-diagnostics]'); if (button)
            button.textContent = 'Copied diagnostics'; }));
        modal.root.querySelector('[data-action=copy-registry]')?.addEventListener('click', () => perform(async () => { await copyText(registryExportText()); const button = modal?.root.querySelector('[data-action=copy-registry]'); if (button)
            button.textContent = 'Copied registry'; }));
        modal.root.querySelector('[data-action=import-registry]')?.addEventListener('click', openRegistryImport);
        modal.root.querySelector('[data-action=retry-hydration]')?.addEventListener('click', () => perform(async () => { const messageId = state?.config?.lastHydration?.messageId; if (!messageId)
            throw new Error('There is no previous hydration message to retry.'); await hydrateMessage({ messageId }, true, false); }));
        modal.root.querySelector('[data-action=rescan-current]')?.addEventListener('click', () => perform(async () => { const messageId = ctx.messages.getLatestMessageId(); if (!messageId)
            throw new Error('There is no mounted message to rescan.'); await hydrateMessage({ messageId }, true, false); }));
        modal.root.querySelector('[data-action=reset-temporary]')?.addEventListener('click', async () => { const { confirmed } = await ctx.ui.showConfirm({ title: 'Reset temporary Hybrid evidence?', message: 'Removes tentative and dismissed observations plus hydration caches. Confirmed colors and approved corrections stay untouched.', confirmLabel: 'Reset temporary evidence', cancelLabel: 'Cancel', variant: 'warning' }); if (!confirmed)
            return; await perform(async () => { const result = await request('ldc_reset_temporary', { chatId: state.chat.id }, 30000); acceptState(result.state); render(); }); });
    }
    function rememberClass(element) { if (element.dataset.prismOriginalClass == null)
        element.dataset.prismOriginalClass = element.hasAttribute('class') ? element.getAttribute('class') : '\u0000'; }
    function cleanupPaint(element) { const painted = element.classList.contains('ldc-prism-paint'), segment = element.classList.contains('ldc-prism-segment'); element.classList.remove('ldc-prism-paint', 'ldc-prism-segment'); for (const key of ['prismPaint', 'prismSpeaker', 'prismKind', 'prismSource', 'prismConfidence', 'prismConfidenceLevel', 'prismNeedsColor', 'prismUnresolvedReason', 'prismHybridDeferred', 'prismMessageId', 'prismSegmentId'])
        delete element.dataset[key]; if (painted) {
        for (const [property, key] of [['--ldc-color', 'prismOriginalLdcColor'], ['--ldc-fallback', 'prismOriginalLdcFallback'], ['--ldc-gradient', 'prismOriginalLdcGradient']]) {
            const value = element.dataset[key];
            if (value === '\u0000')
                element.style.removeProperty(property);
            else if (value != null)
                element.style.setProperty(property, value);
            delete element.dataset[key];
        }
    } if (segment) {
        const title = element.dataset.prismOriginalTitle, tabindex = element.dataset.prismOriginalTabindex;
        if (title === '\u0000')
            element.removeAttribute('title');
        else if (title != null)
            element.setAttribute('title', title);
        if (tabindex === '\u0000')
            element.removeAttribute('tabindex');
        else if (tabindex != null)
            element.setAttribute('tabindex', tabindex);
        delete element.dataset.prismOriginalTitle;
        delete element.dataset.prismOriginalTabindex;
        element.oncontextmenu = element.onkeydown = element.onpointerdown = element.onpointerup = element.onpointercancel = element.onpointerleave = null;
    } if (painted || segment) {
        const originalClass = element.dataset.prismOriginalClass;
        if (originalClass === '\u0000')
            element.removeAttribute('class');
        else if (originalClass != null)
            element.setAttribute('class', originalClass);
        delete element.dataset.prismOriginalClass;
    } }
    function applyPaint(element, raw) { const paint = safePaint(raw); rememberClass(element); if (!element.classList.contains('ldc-prism-paint'))
        for (const [property, key] of [['--ldc-color', 'prismOriginalLdcColor'], ['--ldc-fallback', 'prismOriginalLdcFallback'], ['--ldc-gradient', 'prismOriginalLdcGradient']])
            element.dataset[key] = element.style.getPropertyValue(property) || '\u0000'; cleanupPaint(element); rememberClass(element); element.classList.add('ldc-prism-paint'); element.style.setProperty('--ldc-fallback', paint.anchor); element.style.setProperty('--ldc-color', paint.stops[0]); const gradient = paint.mode === 'gradient' && paint.stops.length >= 2; element.dataset.prismPaint = gradient ? 'gradient' : 'solid'; if (gradient)
        element.style.setProperty('--ldc-gradient', `linear-gradient(${paint.angle}deg,${paint.stops.join(', ')})`);
    else
        element.style.removeProperty('--ldc-gradient'); }
    function clearRoot(root) { root.querySelectorAll('.ldc-prism-paint,.ldc-prism-segment').forEach(cleanupPaint); root.querySelectorAll('.ldc-prism-unpainted,.ldc-prism-reviewing').forEach(s => s.classList.remove('ldc-prism-unpainted', 'ldc-prism-reviewing')); root.querySelectorAll('.ldc-inline-color').forEach(s => s.replaceWith(document.createTextNode(s.dataset.prismOriginal || s.textContent || ''))); root.querySelectorAll('.ldc-dom-dialogue,.ldc-dom-thought').forEach(s => s.replaceWith(...s.childNodes)); root.classList.remove('ldc-dom-whole'); cleanupPaint(root); root.normalize(); }
    function inlineMatches(text) {
        const out = [], patterns = [/<font\b[^>]*\bcolor\s*=\s*["']?(#[0-9a-f]{6}|#[0-9a-f]{3})["']?[^>]*>([\s\S]*?)<\/font>/gi, /<span\b[^>]*\bstyle\s*=\s*["'][^"']*\bcolor\s*:\s*(#[0-9a-f]{6}|#[0-9a-f]{3})[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi, /\[color\s*=\s*["']?(#[0-9a-f]{6}|#[0-9a-f]{3})["']?\]([\s\S]*?)\[\/color\]/gi];
        for (const pattern of patterns) {
            let m;
            while ((m = pattern.exec(text))) {
                const color = normalizeHex(m[1]);
                if (color)
                    out.push({ start: m.index, end: m.index + m[0].length, original: m[0], color, content: m[2] });
            }
        }
        return out.sort((a, b) => a.start - b.start || b.end - a.end).filter((m, i, list) => !list.slice(0, i).some(p => m.start < p.end));
    }
    function parseSafeInlineMarkup(source) { const template = document.createElement('template'); template.innerHTML = String(source || ''); const allowed = new Set(['EM', 'I', 'STRONG', 'B', 'BR']); function sanitize(node) { if (node.nodeType === Node.TEXT_NODE)
        return document.createTextNode(node.data); const fragment = document.createDocumentFragment(); if (node.nodeType !== Node.ELEMENT_NODE || !allowed.has(node.tagName)) {
        for (const child of [...node.childNodes])
            fragment.append(sanitize(child));
        return fragment;
    } const clean = document.createElement(node.tagName.toLowerCase()); for (const child of [...node.childNodes])
        clean.append(sanitize(child)); return clean; } const fragment = document.createDocumentFragment(); for (const child of [...template.content.childNodes])
        fragment.append(sanitize(child)); return fragment; }
    function renderInline(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(node) { return !node.data || node.parentElement?.closest('code,pre,textarea,script,style,.ldc-inline-color') || structured(logicalBlock(node, root)?.textContent || node.data) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }), nodes = [];
        while (walker.nextNode())
            nodes.push(walker.currentNode);
        for (let n = nodes.length - 1; n >= 0; n--)
            for (const m of inlineMatches(nodes[n].data).reverse()) {
                const middle = nodes[n].splitText(m.start);
                middle.splitText(m.end - m.start);
                const span = document.createElement('span');
                span.className = 'ldc-inline-color';
                span.dataset.prismOriginal = m.original;
                span.dataset.prismOriginalColor = m.color;
                span.dataset.prismLegacySource = /^\[color/i.test(m.original) ? 'bbcode' : 'escaped-tag';
                span.style.setProperty('--ldc-color', m.color);
                span.replaceChildren(parseSafeInlineMarkup(m.content));
                middle.replaceWith(span);
            }
    }
    function structured(value) {
        const text = String(value || '').trim();
        if (!text)
            return false;
        if (/^```(?:json|js|javascript|regex)?/i.test(text))
            return true;
        if (text[0] === '{' || text[0] === '[') {
            try {
                JSON.parse(text);
                return true;
            }
            catch { }
        }
        const lines = text.split(/\r?\n/).filter(x => x.trim()), hits = lines.filter(x => /^\s*["'][^"']+["']\s*:\s*(?:["'{[\d-]|true\b|false\b|null\b)/i.test(x) || /^\s*[{}[\],]+\s*$/.test(x));
        return hits.length >= Math.max(1, Math.ceil(lines.length * .55));
    }
    function candidates() {
        const all = state?.characters || [];
        const confirmed = all.map(c => { const binding = c.binding || null, color = bindingRegistryColor(binding), names = [c.name, ...(binding?.aliases || c.aliases || [])], parts = String(c.name || '').split(/\s+/).filter(x => x.length >= 2); for (const part of [parts[0], parts.at(-1)].filter(Boolean)) {
            const owners = all.filter(x => String(x.name || '').split(/\s+/).some(t => t.toLowerCase() === part.toLowerCase()));
            if (owners.length === 1)
                names.push(part);
        } const stableId = String(binding?.speakerUid || binding?.targetId || c.entityId || c.characterId || c.id); return { key: `character:${stableId}`, id: String(c.id), characterId: String(c.characterId || ''), name: c.name, names: [...new Set(names.map(x => String(x || '').trim().toLowerCase()).filter(Boolean))], color, binding, channels: color ? safeChannels(binding) : null, paintable: Boolean(color), primary: String(c.characterId || '') === String(state?.chat?.characterId || '') }; });
        const tentative = (state?.reviewGroups || []).filter(group => (group.kind === 'new-speaker' || group.kind === 'unknown-color') && group.observedColor).map(group => { const name = group.inferredName || `Unknown ${group.observedColor}`, color = normalizeHex(group.observedColor), speakerUid = `tentative-${hashText(group.groupKey)}`, binding = { kind: 'character', targetId: group.groupKey, name, aliases: [], color, channels: safeChannels(null, color), previousColors: [], speakerUid }; return { key: `character:${speakerUid}`, id: group.groupKey, characterId: '', name, names: [name.toLowerCase()], color, binding, channels: binding.channels, paintable: Boolean(color), primary: false, tentative: true }; });
        return [...confirmed, ...tentative];
    }
    function rgbHex(value) { const direct = normalizeHex(value); if (direct)
        return direct; const match = String(value || '').match(/^rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/i); return match ? `#${match.slice(1, 4).map(x => Math.max(0, Math.min(255, Number(x))).toString(16).padStart(2, '0')).join('').toUpperCase()}` : null; }
    function messageSurfaceColor() { const mounted = ctx.dom.listMessageElements(), message = mounted[mounted.length - 1]?.element || document.querySelector('[data-component="MessageContent"]'), nodes = [message?.closest('[class*="messageBubble"]'), message?.parentElement, document.querySelector('[class*="chatColumnInner"]'), document.body, document.documentElement]; for (const node of nodes) {
        if (!node)
            continue;
        const value = getComputedStyle(node).backgroundColor;
        if (/rgba\([^)]*,\s*0(?:\.0+)?\s*\)$/i.test(value) || value === 'transparent')
            continue;
        const color = rgbHex(value);
        if (color)
            return color;
    } for (const property of ['--lumiverse-bg-elevated', '--lumiverse-bg', '--background']) {
        const color = rgbHex(getComputedStyle(document.documentElement).getPropertyValue(property));
        if (color)
            return color;
    } return '#15131D'; }
    function explicitElementColor(element) { return normalizeHex(element.getAttribute('color')) || normalizeHex(element.dataset.prismOriginalColor) || rgbHex(element.style?.color); }
    function candidateForExistingColor(color, list) { const normalized = normalizeHex(color); if (!normalized)
        return null; const matches = list.filter(c => [bindingRegistryColor(c.binding), c.binding?.color, c.binding?.channels?.dialogue?.paint?.anchor, c.binding?.channels?.thought?.paint?.anchor, ...(c.binding?.previousColors || [])].map(normalizeHex).filter(Boolean).includes(normalized)); return matches.length === 1 ? matches[0] : null; }
    function themeBoundColors(root) { const signature = [document.documentElement.className, document.documentElement.getAttribute('style') || '', document.body?.className || '', document.body?.getAttribute('style') || '', root?.closest('[class*="chatColumn"]')?.className || ''].join('|'); if (themeColorCache && themeColorSignature === signature)
        return new Set(themeColorCache); const colors = new Set(), properties = ['--lumiverse-primary', '--lumiverse-primary-hover', '--lumiverse-primary-active', '--lumiverse-accent', '--lumiverse-text', '--lumiverse-text-muted', '--lumiverse-text-dim', '--lumiverse-text-secondary', '--lumiverse-link', '--lumiverse-info', '--primary', '--primary-color', '--accent-color']; for (const node of [document.documentElement, document.body, root]) {
        if (!node)
            continue;
        const style = getComputedStyle(node), textColor = rgbHex(style.color);
        if (textColor)
            colors.add(textColor);
        for (const property of properties) {
            const color = rgbHex(style.getPropertyValue(property));
            if (color)
                colors.add(color);
        }
    } themeColorCache = new Set(colors); themeColorSignature = signature; return colors; }
    function collectExisting(root, list) { const selector = 'font[color],span[style*="color"],em[style*="color"],i[style*="color"],[data-prism-original-color],.ldc-inline-color', map = new Map(), themeColors = themeBoundColors(root); for (const element of root.querySelectorAll(selector)) {
        if (element.closest('code,pre,textarea,script,style') || structured(logicalBlock(element, root)?.textContent || ''))
            continue;
        const parentExisting = element.parentElement?.closest(selector);
        if (element !== root && parentExisting && root.contains(parentExisting) && map.has(parentExisting))
            continue;
        const color = explicitElementColor(element);
        if (!color)
            continue;
        const protectedMarkup = element.tagName === 'FONT' || element.hasAttribute('data-prism-original-color') || element.classList.contains('ldc-inline-color'), source = element.dataset.prismLegacySource || (element.tagName === 'FONT' ? 'font' : protectedMarkup ? 'escaped-tag' : 'inline-style');
        if (source === 'inline-style' && !protectedMarkup && themeColors.has(color))
            continue;
        const text = element.textContent || '', italic = Boolean(element.closest('em,i') || element.querySelector('em,i')), kind = italic && !/[“”"]/.test(text) ? 'thought' : 'dialogue';
        map.set(element, { element, text, color, speaker: candidateForExistingColor(color, list), kind, source, protected: true });
    } return map; }
    function applyApprovedObservations(existing, mc, list) { const approved = Object.values(state?.config?.observations || {}).filter(observation => observation.status === 'approved' && observation.resolvedSpeakerUid && String(observation.messageId) === String(mc.messageId) && Number(observation.swipeId || 0) === Number(mc.swipeId || 0)), seen = new Map(); for (const segment of existing.values()) {
        const normalized = String(segment.text || '').replace(/\s+/g, ' ').trim().toLowerCase(), key = `${segment.color}:${normalized}`, occurrenceIndex = seen.get(key) || 0;
        seen.set(key, occurrenceIndex + 1);
        const observation = approved.find(item => item.observedColor === segment.color && String(item.quote || '').replace(/\s+/g, ' ').trim().toLowerCase() === normalized && Number(item.occurrenceIndex || 0) === occurrenceIndex);
        if (!observation)
            continue;
        const speaker = list.find(candidate => candidate.binding?.speakerUid === observation.resolvedSpeakerUid);
        if (speaker) {
            segment.speaker = speaker;
            segment.hydrationApproved = true;
        }
    } }
    function named(c, text) { const lower = String(text || '').toLowerCase(); return c.names.some(name => new RegExp(`(^|[^\\p{L}\\p{N}_])${reEsc(name)}(?=$|[^\\p{L}\\p{N}_])`, 'u').test(lower)); }
    function logicalBlock(node, root) {
        const parent = node.parentElement, semantic = parent?.closest('p,li,blockquote,dd,dt,figcaption');
        if (semantic && root.contains(semantic))
            return semantic;
        for (const child of root.children)
            if (child.contains(node))
                return child;
        return root;
    }
    function dialogueOnlyBlock(value) { return String(value || '').replace(/“[^”\n]+”|"[^"\n]+"/g, '').replace(/[\s*_~()[\]{}.,!?;:'—–-]/g, '').length === 0; }
    function latestSpeakerPair(anchors) { const pair = []; for (let i = anchors.length - 1; i >= 0; i--) {
        const speaker = anchors[i];
        if (speaker && !pair.some(existing => existing.key === speaker.key))
            pair.unshift(speaker);
        if (pair.length === 2)
            break;
    } return pair; }
    function explicit(text, start, end, list) {
        const before = text.slice(0, start), after = text.slice(end), beforeLine = before.slice(before.lastIndexOf('\n') + 1), afterBreak = after.indexOf('\n'), afterLine = after.slice(0, afterBreak === -1 ? after.length : afterBreak), verbs = VERBS.map(reEsc).join('|');
        for (const c of list)
            for (const rawName of c.names) {
                const name = reEsc(rawName);
                if (new RegExp(`(?:^|\\n)\\s*(?:\\*\\*|\\[)?${name}(?:\\*\\*|\\])?\\s*(?::|[—–-])\\s*$`, 'iu').test(before))
                    return { speaker: c, confidence: .99, source: 'speaker-label' };
                if (new RegExp(`${name}\\s+(?:${verbs})\\b(?:[^"“”\\n]{0,220})?$`, 'iu').test(beforeLine.slice(-300)))
                    return { speaker: c, confidence: .95, source: 'reporting-verb' };
                if (new RegExp(`^\\s*[,;.!?—–-]*\\s*(?:\\*\\*|\\[)?${name}(?:\\*\\*|\\])?\\s+(?:${verbs})\\b(?:[^"“”\\n]{0,220})?`, 'iu').test(afterLine.slice(0, 300)))
                    return { speaker: c, confidence: .95, source: 'reporting-verb' };
                if (new RegExp(`^\\s*[,;.!?—–-]*\\s*(?:${verbs})\\s+(?:\\*\\*|\\[)?${name}(?:\\*\\*|\\])?\\b`, 'iu').test(afterLine.slice(0, 180)))
                    return { speaker: c, confidence: .94, source: 'reporting-verb' };
                if (new RegExp(`^\\s*[,;.!?—–-]*\\s*(?:(?:came|rang|called)\\s+(?:from\\s+)?)?(?:\\*\\*|\\[)?${name}(?:\\*\\*|\\])?(?:['’]s)?\\s+(?:voice|answer|reply|tone|words?)\\b`, 'iu').test(afterLine.slice(0, 220)))
                    return { speaker: c, confidence: .86, source: 'speech-noun' };
                if (new RegExp(`${name}(?:['’]s)?\\s+(?:voice|answer|reply|tone|words?)\\b(?:[^"“”\\n]{0,180})?$`, 'iu').test(beforeLine.slice(-240)))
                    return { speaker: c, confidence: .85, source: 'speech-noun' };
                if (new RegExp(`${name}\\s+[\\p{Ll}][\\p{L}'’-]{2,28}\\b(?:[^"“”\\n]{0,180})?$`, 'iu').test(beforeLine.slice(-240)))
                    return { speaker: c, confidence: .79, source: 'structural-speech-tag' };
                if (new RegExp(`^\\s*[,;.!?—–-]*\\s*(?:\\*\\*|\\[)?${name}(?:\\*\\*|\\])?\\s+[\\p{Ll}][\\p{L}'’-]{2,28}\\b(?:[^"“”\\n]{0,180})?`, 'iu').test(afterLine.slice(0, 240)))
                    return { speaker: c, confidence: .79, source: 'structural-speech-tag' };
            }
        return null;
    }
    function resolveAttr({ text, start, end, list, bubble, sameBlockSpeaker, anchors, lastTurnSpeaker, standalone }) {
        const mode = state?.preferences?.domAttributionMode || 'balanced', hit = explicit(text, start, end, list);
        if (hit)
            return hit;
        if (sameBlockSpeaker)
            return { speaker: sameBlockSpeaker, confidence: .86, source: 'paragraph-continuity' };
        if (mode === 'strict')
            return { speaker: null, confidence: 0, source: 'unresolved' };
        const before = text.slice(0, start), line = before.slice(before.lastIndexOf('\n') + 1), lines = before.split(/\r?\n/), previousLine = lines.length > 1 ? lines.at(-2) : '', actionMatches = list.filter(c => named(c, line.slice(-220)));
        if (actionMatches.length === 1 && /[.!?*]\s*$/.test(line))
            return { speaker: actionMatches[0], confidence: .78, source: 'action-beat' };
        if (standalone && lastTurnSpeaker) {
            const pair = latestSpeakerPair(anchors);
            if (pair.length === 2) {
                const alternate = pair.find(c => c.key !== lastTurnSpeaker.key);
                if (alternate)
                    return { speaker: alternate, confidence: .76, source: 'alternation' };
            }
        }
        if (previousLine && !/[“”"]/.test(previousLine)) {
            const previousMatches = list.filter(c => named(c, previousLine.slice(-220)));
            if (previousMatches.length === 1)
                return { speaker: previousMatches[0], confidence: .68, source: 'previous-line' };
        }
        if (bubble)
            return { speaker: bubble, confidence: list.length === 1 ? .84 : .61, source: 'bubble-author' };
        if (list.length === 1)
            return { speaker: list[0], confidence: .82, source: 'bubble-author' };
        if (mode === 'aggressive') {
            const fallback = list.find(c => c.primary) || list[0] || null;
            return { speaker: fallback, confidence: .34, source: fallback ? 'fallback' : 'unresolved' };
        }
        return { speaker: null, confidence: 0, source: 'unresolved' };
    }
    function bubbleAuthor(element, list) { const values = [element.dataset.characterId, element.dataset.speakerId, element.dataset.authorId, element.dataset.characterName, element.dataset.speaker, element.dataset.author].filter(Boolean).map(x => String(x).toLowerCase()), matches = list.filter(c => values.includes(c.id.toLowerCase()) || values.includes(c.characterId.toLowerCase()) || c.names.some(n => values.includes(n))); return matches.length === 1 ? matches[0] : null; }
    function overrideFor(messageId, swipeId, contentHash, segmentKey) { const o = state?.config?.overrides?.[`${messageId}:${swipeId}:${segmentKey}`]; return o?.contentHash === contentHash ? o : null; }
    async function teach(event, detail, list) {
        event?.preventDefault?.();
        event?.stopPropagation?.();
        const rect = detail.rect, position = event?.clientX != null ? { x: event.clientX, y: event.clientY } : { x: rect.left + rect.width / 2, y: rect.bottom }, a = detail.attribution;
        const items = [{ key: 'summary', label: detail.existingColor ? `Existing color: ${detail.existingColor}` : (a.speaker ? `Prism thinks this is ${a.speaker.name}` : 'Prism left this uncolored'), disabled: true }, { key: 'evidence', label: `${a.speaker ? `Speaker: ${a.speaker.name}${a.speaker.paintable ? '' : ' · color not assigned'} · ` : ''}${evidenceLabel(a.source)} · ${Math.round(a.confidence * 100)}%`, disabled: true }, { key: 'speaker-head', label: 'Speaker', disabled: true }, { key: 'add-person', label: 'Add new character…' }, ...list.map(c => ({ key: `speaker:${c.key}`, label: `${c.name}${c.paintable ? '' : ' · no color'}`, active: c.key === a.speaker?.key })), { key: 'speaker:none', label: 'Keep unassigned', active: !a.speaker }, { key: 'kind-head', label: 'Content type', disabled: true }, { key: 'kind:dialogue', label: 'Dialogue', active: detail.kind === 'dialogue' }, { key: 'kind:thought', label: 'Thought', active: detail.kind === 'thought' }, { key: 'kind:ignored', label: 'Leave unstyled', active: detail.kind === 'ignored' }], result = await ctx.ui.showContextMenu({ position, items }), selected = result.selectedKey;
        if (!selected || ['summary', 'evidence', 'speaker-head', 'kind-head'].includes(selected))
            return;
        if (selected === 'add-person') {
            if (!modal)
                await openPalette();
            openAddPerson(detail.existingColor || null);
            return;
        }
        let speakerKey = a.speaker?.key || null, kind = detail.kind || 'dialogue';
        if (selected.startsWith('speaker:'))
            speakerKey = selected === 'speaker:none' ? null : selected.slice(8);
        if (selected.startsWith('kind:'))
            kind = selected.slice(5);
        if (kind === 'ignored')
            speakerKey = null;
        setSaveStatus('saving');
        try {
            const response = await request('ldc_save_override', { chatId: state.chat.id, messageId: detail.messageId, swipeId: detail.swipeId, contentHash: detail.contentHash, segmentKey: detail.segmentKey, quote: detail.quote, speakerKey, kind, existingColor: detail.existingColor || null });
            acceptState(response.state);
            setSaveStatus('saved');
            if (modal)
                render();
        }
        catch (error) {
            setSaveStatus('error');
            throw error;
        }
    }
    function decorate(span, detail, list) {
        const assignableList = list.filter(candidate => !candidate.tentative), a = detail.attribution, colorOwners = detail.existingColor ? assignableList.filter(c => [c.color, bindingRegistryColor(c.binding), c.binding?.channels?.dialogue?.paint?.anchor, ...(c.binding?.previousColors || [])].map(normalizeHex).filter(Boolean).includes(normalizeHex(detail.existingColor))).length : 0, reason = detail.hybridDeferred ? 'hybrid-low-confidence' : a.speaker?.tentative ? 'tentative-speaker' : a.speaker && !a.speaker.paintable ? 'speaker-known-no-color' : !a.speaker && detail.existingColor ? (colorOwners > 1 ? 'ambiguous-color' : 'speaker-not-found') : !a.speaker ? 'no-dialogue-seed' : null;
        rememberClass(span);
        if (!span.classList.contains('ldc-prism-segment')) {
            span.dataset.prismOriginalTitle = span.getAttribute('title') ?? '\u0000';
            span.dataset.prismOriginalTabindex = span.getAttribute('tabindex') ?? '\u0000';
        }
        span.classList.add('ldc-prism-segment');
        span.tabIndex = 0;
        Object.assign(span.dataset, { prismMessageId: detail.messageId, prismSegmentId: detail.segmentKey, prismSpeaker: a.speaker?.name || '', prismKind: detail.kind || 'dialogue', prismSource: a.source, prismConfidence: a.confidence.toFixed(2) });
        if (reason)
            span.dataset.prismUnresolvedReason = reason;
        else
            delete span.dataset.prismUnresolvedReason;
        if (a.speaker && !a.speaker.paintable)
            span.dataset.prismNeedsColor = 'true';
        else
            delete span.dataset.prismNeedsColor;
        if (detail.hybridDeferred)
            span.dataset.prismHybridDeferred = 'true';
        else
            delete span.dataset.prismHybridDeferred;
        if (state?.preferences?.markUncertain !== false && a.confidence < .7)
            span.dataset.prismConfidenceLevel = 'low';
        span.title = detail.hybridDeferred ? `Hybrid left this unpainted: ${a.speaker?.name || 'speaker'} was only ${Math.round(a.confidence * 100)}% certain. Right-click to confirm.` : a.speaker?.tentative ? `${a.speaker.name} · observed by Hybrid, awaiting approval` : a.speaker ? `${a.speaker.name} · ${a.speaker.paintable ? `assigned from ${evidenceLabel(a.source)} · ${Math.round(a.confidence * 100)}%` : 'identified, but no color is assigned yet'}` : (detail.existingColor ? `Existing ${detail.existingColor} · ${colorOwners > 1 ? 'claimed by multiple speakers' : 'speaker unknown'}` : 'Prism could not identify this speaker');
        const info = () => ({ ...detail, rect: span.getBoundingClientRect() });
        span.oncontextmenu = e => teach(e, info(), assignableList);
        span.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ')
            teach(e, info(), assignableList); };
        span.onpointerdown = e => { clearTimeout(longTimer); longTimer = setTimeout(() => teach(e, info(), assignableList), 560); };
        span.onpointerup = span.onpointercancel = span.onpointerleave = () => clearTimeout(longTimer);
    }
    function buildDomUnits(root, existingByElement) {
        const units = [], blockIds = new Map();
        let nextBlockId = 0;
        const blockId = block => { if (!blockIds.has(block))
            blockIds.set(block, nextBlockId++); return blockIds.get(block); };
        function visit(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node;
                if (existingByElement.has(element)) {
                    const block = logicalBlock(element, root);
                    units.push({ type: 'existing', element, text: element.textContent || '', block, blockId: blockId(block), segment: existingByElement.get(element) });
                    return;
                }
                if (element.matches('code,pre,textarea,button,script,style'))
                    return;
                for (const child of element.childNodes)
                    visit(child);
                return;
            }
            if (node.nodeType === Node.TEXT_NODE && node.data) {
                const block = logicalBlock(node, root);
                if (!structured(block?.textContent || node.data))
                    units.push({ type: 'text', node, text: node.data, block, blockId: blockId(block) });
            }
        }
        visit(root);
        return units;
    }
    function partsForRange(units, start, end) {
        if (units.some(unit => unit.type === 'existing' && unit.start < end && unit.end > start))
            return null;
        const parts = units.filter(unit => unit.type === 'text' && unit.start < end && unit.end > start).map(unit => ({ unit, node: unit.node, from: Math.max(0, start - unit.start), to: Math.min(unit.text.length, end - unit.start) }));
        if (!parts.length || parts.some(part => part.unit.blockId !== parts[0].unit.blockId))
            return null;
        return parts;
    }
    function wrapDetectedJob(job) {
        const span = document.createElement('span');
        span.className = job.kind === 'thought' ? 'ldc-dom-thought' : 'ldc-dom-dialogue';
        const first = job.parts[0], last = job.parts.at(-1);
        if (job.parts.length === 1) {
            const middle = first.node.splitText(first.from);
            middle.splitText(first.to - first.from);
            middle.replaceWith(span);
            span.appendChild(middle);
        }
        else {
            const range = document.createRange();
            range.setStart(first.node, first.from);
            range.setEnd(last.node, last.to);
            const fragment = range.extractContents();
            range.insertNode(span);
            span.appendChild(fragment);
        }
        return span;
    }
    function colorQuotes(root, mc, list, fixed = null, fillMissing = true) {
        const existing = collectExisting(root, list);
        applyApprovedObservations(existing, mc, list);
        const units = buildDomUnits(root, existing);
        let text = '', lastBlock = null;
        for (const unit of units) {
            if (text && unit.block !== lastBlock)
                text += '\n\n';
            unit.start = text.length;
            text += unit.text;
            unit.end = text.length;
            lastBlock = unit.block;
        }
        const contentHash = hashText(text), occurrences = new Map(), jobs = [], anchors = mc.bubble ? [mc.bubble] : [];
        let currentBlockId = -1, currentBlockSpeaker = null, lastTurnSpeaker = null, existingIndex = 0;
        const events = units.filter(unit => unit.type === 'existing').map(unit => ({ type: 'existing', start: unit.start, block: unit.block, blockId: unit.blockId, unit }));
        if (fillMissing)
            for (const match of text.matchAll(/“[^”\n]+”|"[^"\n]+"/g)) {
                const start = match.index, end = start + match[0].length, parts = partsForRange(units, start, end);
                if (parts)
                    events.push({ type: 'quote', start, end, block: parts[0].unit.block, blockId: parts[0].unit.blockId, parts, quote: match[0] });
            }
        events.sort((a, b) => a.start - b.start || (a.type === 'existing' ? -1 : 1));
        for (const event of events) {
            if (event.blockId !== currentBlockId) {
                currentBlockId = event.blockId;
                currentBlockSpeaker = null;
            }
            if (event.type === 'existing') {
                const unit = event.unit, segment = unit.segment, normalized = unit.text.replace(/\s+/g, ' ').trim().toLowerCase(), segmentKey = hashText(['existing', segment.color, normalized, existingIndex++].join('\u241F')), override = overrideFor(mc.messageId, mc.swipeId, contentHash, segmentKey), kind = override?.kind || segment.kind, attribution = override ? { speaker: override.speakerKey == null ? null : list.find(c => c.key === override.speakerKey) || null, confidence: 1, source: 'manual' } : { speaker: segment.speaker, confidence: segment.speaker ? (segment.hydrationApproved ? 1 : .98) : 0, source: segment.speaker ? (segment.hydrationApproved ? 'manual' : 'existing-color') : 'unresolved' };
                segment.speaker = attribution.speaker;
                segment.kind = kind;
                if (attribution.speaker && kind !== 'ignored') {
                    const channel = attribution.speaker.channels?.[kind];
                    if (state?.preferences?.existingStylePolicy !== 'preserve' && channel?.enabled)
                        applyPaint(unit.element, channel.paint);
                }
                decorate(unit.element, { messageId: mc.messageId, swipeId: mc.swipeId, segmentKey, contentHash, quote: unit.text, attribution, kind, existingColor: segment.color }, list);
                if (state?.preferences?.useExistingAsEvidence !== false && attribution.speaker && kind === 'dialogue') {
                    currentBlockSpeaker = attribution.speaker;
                    lastTurnSpeaker = attribution.speaker;
                    anchors.push(attribution.speaker);
                    if (anchors.length > 10)
                        anchors.shift();
                }
                continue;
            }
            const normalized = event.quote.replace(/\s+/g, ' ').trim().toLowerCase(), occurrenceIndex = occurrences.get(normalized) || 0;
            occurrences.set(normalized, occurrenceIndex + 1);
            const segmentKey = hashText([normalized, text.slice(Math.max(0, event.start - 48), event.start), text.slice(event.end, event.end + 48), occurrenceIndex].join('\u241F')), override = overrideFor(mc.messageId, mc.swipeId, contentHash, segmentKey);
            let attribution = override ? { speaker: override.speakerKey == null ? null : list.find(c => c.key === override.speakerKey) || null, confidence: 1, source: 'manual' } : (fixed || resolveAttr({ text, start: event.start, end: event.end, list, bubble: mc.bubble, sameBlockSpeaker: currentBlockSpeaker, anchors, lastTurnSpeaker, standalone: dialogueOnlyBlock(event.block?.textContent) })), kind = override?.kind || 'dialogue';
            if (kind === 'ignored')
                attribution = { speaker: null, confidence: 1, source: 'manual' };
            if (attribution.speaker && kind === 'dialogue') {
                currentBlockSpeaker = attribution.speaker;
                lastTurnSpeaker = attribution.speaker;
            }
            if (attribution.speaker && kind === 'dialogue' && ['manual', 'speaker-label', 'reporting-verb', 'structural-speech-tag', 'speech-noun', 'action-beat'].includes(attribution.source)) {
                anchors.push(attribution.speaker);
                if (anchors.length > 10)
                    anchors.shift();
            }
            jobs.push({ parts: event.parts, quote: event.quote, segmentKey, contentHash, attribution, kind });
        }
        for (let i = jobs.length - 1; i >= 0; i--) {
            const job = jobs[i], speaker = job.attribution.speaker, channel = speaker?.channels?.[job.kind], span = wrapDetectedJob(job), hybrid = normalizeEngine(state?.config?.engine) === 'hybrid', hybridDeferred = Boolean(hybrid && job.attribution.source !== 'manual' && job.attribution.confidence < .68), paintable = speaker && channel?.enabled && job.kind !== 'ignored' && !hybridDeferred;
            if (paintable)
                applyPaint(span, channel.paint);
            else {
                rememberClass(span);
                span.classList.add('ldc-prism-unpainted');
            }
            decorate(span, { messageId: mc.messageId, swipeId: mc.swipeId, segmentKey: job.segmentKey, contentHash: job.contentHash, quote: job.quote, attribution: job.attribution, kind: job.kind, hybridDeferred }, list);
        }
        return { contentHash, existing };
    }
    function conservativeThoughtAttribution(element, mc, list) { const block = logicalBlock(element, element.closest('[data-component=MessageContent]') || element.parentElement), text = String(block?.textContent || ''), namedMatches = list.filter(c => named(c, text)); if (namedMatches.length === 1)
        return { speaker: namedMatches[0], confidence: .78, source: 'action-beat' }; const established = [...(block?.querySelectorAll?.('[data-prism-speaker]') || [])].map(x => x.dataset.prismSpeaker).filter(Boolean).at(-1), same = list.find(c => c.name === established); if (same)
        return { speaker: same, confidence: .72, source: 'paragraph-continuity' }; if (mc.bubble)
        return { speaker: mc.bubble, confidence: list.length === 1 ? .82 : .61, source: 'bubble-author' }; if (list.length === 1)
        return { speaker: list[0], confidence: .8, source: 'bubble-author' }; return { speaker: null, confidence: 0, source: 'unresolved' }; }
    function colorThoughts(root, mc, list) { const mode = state?.preferences?.thoughtDetection || 'off'; if (mode === 'off')
        return; const contentHash = hashText(root.textContent || ''), italics = mode === 'italics' || mode === 'italics-and-single-quotes', singles = mode === 'single-quotes' || mode === 'italics-and-single-quotes'; if (italics)
        for (const element of root.querySelectorAll('em,i')) {
            if (element.closest('code,pre,textarea,script,style,font,.ldc-inline-color') || element.querySelector('font,.ldc-inline-color,.ldc-prism-segment') || element.classList.contains('ldc-prism-segment'))
                continue;
            const quote = element.textContent || '';
            if (!quote.trim() || /[“”"]/.test(quote) || structured(quote))
                continue;
            const segmentKey = hashText(['thought', quote.trim().toLowerCase(), String([...root.querySelectorAll('em,i')].indexOf(element))].join('\u241F')), override = overrideFor(mc.messageId, mc.swipeId, contentHash, segmentKey), kind = override?.kind || 'thought', attribution = override ? { speaker: override.speakerKey == null ? null : list.find(c => c.key === override.speakerKey) || null, confidence: 1, source: 'manual' } : conservativeThoughtAttribution(element, mc, list), channel = attribution.speaker?.channels?.[kind];
            if (kind !== 'ignored' && channel?.enabled)
                applyPaint(element, channel.paint);
            else
                element.classList.add('ldc-prism-unpainted');
            decorate(element, { messageId: mc.messageId, swipeId: mc.swipeId, segmentKey, contentHash, quote, attribution, kind }, list);
        } if (singles) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(node) { return !node.data.trim() || node.parentElement?.closest('code,pre,textarea,script,style,font,em,i,.ldc-inline-color,.ldc-prism-segment') || structured(logicalBlock(node, root)?.textContent) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }), nodes = [];
        while (walker.nextNode())
            nodes.push(walker.currentNode);
        for (let n = nodes.length - 1; n >= 0; n--)
            for (const match of [...nodes[n].data.matchAll(/‘[^’\n]+’|(?<![\p{L}\p{N}])'[^'\n]{2,}'(?![\p{L}\p{N}])/gu)].reverse()) {
                const quote = match[0], segmentKey = hashText(['single-thought', quote.trim().toLowerCase(), match.index].join('\u241F')), override = overrideFor(mc.messageId, mc.swipeId, contentHash, segmentKey), probe = document.createElement('span');
                probe.textContent = quote;
                nodes[n].parentElement?.appendChild(probe);
                const attribution = override ? { speaker: override.speakerKey == null ? null : list.find(c => c.key === override.speakerKey) || null, confidence: 1, source: 'manual' } : conservativeThoughtAttribution(probe, mc, list), kind = override?.kind || 'thought', channel = attribution.speaker?.channels?.[kind];
                probe.remove();
                const middle = nodes[n].splitText(match.index);
                middle.splitText(quote.length);
                const span = document.createElement('span');
                span.className = 'ldc-dom-thought';
                middle.replaceWith(span);
                span.appendChild(middle);
                if (channel?.enabled && kind !== 'ignored')
                    applyPaint(span, channel.paint);
                else
                    span.classList.add('ldc-prism-unpainted');
                decorate(span, { messageId: mc.messageId, swipeId: mc.swipeId, segmentKey, contentHash, quote, attribution, kind }, list);
            }
    } }
    function processMounted(force = false) {
        if (applying)
            return;
        applying = true;
        observer.disconnect();
        try {
            const list = candidates(), personaBinding = state?.config?.personaEnabled !== false ? state?.persona?.binding : null, personaColor = normalizeHex(personaBinding?.color);
            for (const { messageId, element } of ctx.dom.listMessageElements()) {
                const content = element.querySelector('[data-component=MessageContent]');
                if (!content)
                    continue;
                const sig = `${revision}:${hashText(content.textContent || '')}`, cached = signatures.get(messageId);
                if (!force && !dirty.has(messageId) && cached?.sig === sig && cached?.element === content)
                    continue;
                clearRoot(content);
                renderInline(content);
                if (state?.ok) {
                    const swipeId = Math.max(0, Number(element.dataset.swipeId) || 0), engine = normalizeEngine(state.config.engine), overpass = engine === 'dom' || engine === 'hybrid';
                    if (element.dataset.part === 'user') {
                        const p = personaColor ? { key: `persona:${personaBinding.targetId}`, name: state.persona.name, names: [state.persona.name.toLowerCase()], color: personaColor, binding: personaBinding, channels: safeChannels(personaBinding) } : null, mc = { messageId, swipeId, bubble: p }, fill = Boolean(overpass && p && state.config.autoUserMode === 'quoted');
                        colorQuotes(content, mc, p ? [p] : [], fill ? { speaker: p, confidence: .99, source: 'bubble-author' } : null, fill);
                        if (overpass && p) {
                            if (state.config.autoUserMode === 'whole' && p.channels.dialogue.enabled) {
                                content.classList.add('ldc-dom-whole');
                                applyPaint(content, p.channels.dialogue.paint);
                            }
                            colorThoughts(content, mc, [p]);
                        }
                    }
                    else {
                        const mc = { messageId, swipeId, bubble: bubbleAuthor(element, list) };
                        colorQuotes(content, mc, list, null, overpass);
                        if (overpass)
                            colorThoughts(content, mc, list);
                    }
                }
                signatures.set(messageId, { sig: `${revision}:${hashText(content.textContent || '')}`, element: content });
                dirty.delete(messageId);
            }
        }
        finally {
            applying = false;
            observe();
        }
    }
    function schedule(immediate = false) { clearTimeout(refreshTimer); refreshTimer = setTimeout(() => processMounted(false), immediate ? 0 : 70); }
    function markLatest() { const id = ctx.messages.getLatestMessageId(); if (id)
        dirty.add(id); schedule(); }
    function eventGenerationId(payload) { return String(payload?.generationId || payload?.generation_id || payload?.requestId || payload?.request_id || ''); }
    function setMessageStreaming(messageId, value) { if (!messageId)
        return; for (const item of ctx.dom.listMessageElements()) {
        if (String(item.messageId) !== String(messageId))
            continue;
        if (value)
            item.element.dataset.prismStreaming = 'true';
        else
            delete item.element.dataset.prismStreaming;
    } }
    function markStreaming(payload = {}) { if (payload.chatId && state?.chat?.id && String(payload.chatId) !== String(state.chat.id))
        return; const generationId = eventGenerationId(payload); if (generationId)
        activeGenerationIds.add(generationId); const messageId = String(payload.messageId || ctx.messages.getLatestMessageId() || ''); if (messageId) {
        streamingMessageIds.add(messageId);
        setMessageStreaming(messageId, true);
        dirty.add(messageId);
    } schedule(); }
    function clearStreaming(payload = {}) { const generationId = eventGenerationId(payload); if (generationId)
        activeGenerationIds.delete(generationId); const messageId = String(payload.messageId || ''); if (messageId) {
        streamingMessageIds.delete(messageId);
        setMessageStreaming(messageId, false);
        dirty.add(messageId);
    } if (!generationId || activeGenerationIds.size === 0) {
        for (const id of streamingMessageIds) {
            setMessageStreaming(id, false);
            dirty.add(id);
        }
        streamingMessageIds.clear();
    } schedule(true); }
    async function hydrateMessage(payload = {}, force = false, quiet = false) {
        const messageId = String(payload.messageId || ctx.messages.getLatestMessageId() || '');
        markLatest();
        if (!messageId || !state?.ok || normalizeEngine(state.config.engine) !== 'hybrid' || hydratingMessages.has(messageId))
            return;
        hydratingMessages.add(messageId);
        setHydrationStatus('syncing');
        try {
            const response = await request('ldc_hydrate_message', { chatId: state.chat.id, messageId, generationId: eventGenerationId(payload), generationEndedAt: Date.now(), force }, 30000);
            acceptState(response.state);
            dirty.add(messageId);
            schedule(true);
            setHydrationStatus(response.pendingCount > 0 ? 'awaiting' : 'idle');
            if (modal)
                render();
            return response;
        }
        catch (error) {
            setHydrationStatus('error');
            if (quiet) {
                console.warn('[Prism] Hybrid hydration failed:', error);
                return;
            }
            throw error;
        }
        finally {
            hydratingMessages.delete(messageId);
        }
    }
    async function hydrateLatest(payload = {}) { clearStreaming(payload); return hydrateMessage(payload, false, true); }
    function ensureToolbar() {
        const toolbar = document.querySelector('[class*="chatToolbar"]');
        if (!toolbar || toolbar.querySelector('[data-prism-toolbar-button]'))
            return;
        if (toolbarInjection?.isConnected)
            ctx.dom.uninject(toolbarInjection);
        toolbarInjection = ctx.dom.inject(toolbar, `<span class="ldc-toolbar-host"><button class="ldc-toolbar-button" data-prism-toolbar-button title="Prism dialogue colors" aria-label="Open Prism dialogue colors">${PRISM_ICON}</button><button type="button" class="ldc-toolbar-save-state" data-prism-save-status="${saveStatus}" aria-live="polite" aria-label="${saveStatusLabel(saveStatus)}"><i></i><span data-prism-save-label>${saveStatusLabel(saveStatus)}</span></button></span>`, 'beforeend');
        toolbarInjection.querySelector('[data-prism-toolbar-button]')?.addEventListener('click', openMainPalette);
        toolbarInjection.querySelector('[data-prism-save-status]')?.addEventListener('click', () => { if (pendingReviewCount > 0)
            openReviewInbox(); });
        refreshPrismStatus();
    }
    const observer = new MutationObserver(records => { if (records.every(record => record.target instanceof Element && record.target.closest('.ldc-toolbar-host,.ldc-shell')))
        return; ensureToolbar(); schedule(); });
    function observationRoot() { return document.querySelector('[class*="chatColumnInner"]') || document.querySelector('[class*="chatColumn"]') || document.body; }
    function observe() { const root = observationRoot(); if (root) {
        observer.disconnect();
        observer.observe(root, { childList: true, subtree: true });
    } }
    async function openPalette() {
        if (modal) {
            modal.dismiss();
            modal = null;
        }
        sideScroll = 0;
        modal = ctx.ui.showModal({ title: 'Prism', width: 780, maxHeight: 680 });
        modal.onDismiss(() => { modal = null; });
        render();
        if (state?.ok)
            return;
        try {
            const r = await loadState(false);
            acceptState(r.state);
            if (!selectedId)
                selectedId = state?.characters?.[0]?.id || null;
            render();
        }
        catch (error) {
            state = { ok: false, error: error?.message || String(error) };
            render();
        }
    }
    function openMainPalette() { reviewOpen = false; settingsOpen = false; return openPalette(); }
    async function openReviewInbox() { reviewOpen = true; settingsOpen = false; if (!modal)
        await openPalette();
    else
        render(); }
    async function reload(show = false, sync = false) {
        if (show && modal) {
            state = null;
            render();
        }
        try {
            const r = await loadState(sync);
            acceptState(r.state);
            if (!selectedId || !state?.characters?.some(x => String(x.id) === String(selectedId)))
                selectedId = state?.characters?.[0]?.id || null;
            if (modal)
                render();
        }
        catch (error) {
            state = { ok: false, error: error?.message || String(error) };
            if (modal)
                render();
        }
    }
    ensureToolbar();
    observe();
    const action = ctx.ui.registerInputBarAction({ id: 'open-dialogue-colors', label: 'Prism', iconSvg: PRISM_ICON, enabled: true });
    const clearAllStreaming = () => { activeGenerationIds.clear(); streamingMessageIds.clear(); document.querySelectorAll('[data-prism-streaming]').forEach(element => delete element.dataset.prismStreaming); };
    const unsubAction = action.onClick(openMainPalette), unsubChat = ctx.events.on('CHAT_SWITCHED', () => { state = null; reviewOpen = false; settingsOpen = false; hydratingMessages.clear(); clearAllStreaming(); themeColorCache = null; themeColorSignature = ''; setHydrationStatus('idle'); signatures.clear(); dirty.clear(); ensureToolbar(); observe(); reload(true); }), unsubMessage = ctx.events.on('MESSAGE_SENT', markLatest), unsubGenerationStart = ctx.events.on('GENERATION_STARTED', markStreaming), unsubStream = ctx.events.on('STREAM_TOKEN_RECEIVED', markStreaming), unsubGeneration = ctx.events.on('GENERATION_ENDED', hydrateLatest), unsubGenerationStop = ctx.events.on('GENERATION_STOPPED', payload => { clearStreaming(payload); markLatest(); });
    reload();
    return () => {
        for (const task of pending.values()) {
            clearTimeout(task.timer);
            task.reject(new Error('Extension unloaded.'));
        }
        pending.clear();
        clearTimeout(refreshTimer);
        clearTimeout(saveTimer);
        clearTimeout(longTimer);
        observer.disconnect();
        for (const { element } of ctx.dom.listMessageElements()) {
            const content = element.querySelector('[data-component=MessageContent]');
            if (content)
                clearRoot(content);
        }
        clearAllStreaming();
        addModal?.dismiss();
        importModal?.dismiss();
        modal?.dismiss();
        unsubChat();
        unsubMessage();
        unsubGenerationStart();
        unsubStream();
        unsubGeneration();
        unsubGenerationStop();
        unsubAction();
        action.destroy();
        if (toolbarInjection)
            ctx.dom.uninject(toolbarInjection);
        unsubBackend();
        removeStyle();
        ctx.dom.cleanup();
    };
}
