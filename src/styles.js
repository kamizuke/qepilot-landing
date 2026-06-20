export const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
    :root{
      --ink:#161D26; --ink2:#202A37; --ink3:#2C3947;
      --paper:#F7F6F2; --card:#FFFFFF; --line:#DDD8CC; --line2:#C9C3B4;
      --txt:#1C2128; --muted:#7A7466;
      --accent:#E8590C; --ok:#2E7D54; --amber:#B45309;
    }
    *{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{height:100%}
    .app{display:flex;flex-direction:column;height:100vh;background:var(--paper);font-family:'Archivo',system-ui,sans-serif;color:var(--txt)}
    .hdr{display:flex;align-items:center;gap:14px;padding:10px 18px;background:var(--ink);color:#EDEAE2;border-bottom:3px solid var(--accent);flex-wrap:wrap}
    .hdr-brand{display:flex;flex-direction:column;line-height:1}
    .hdr-name{font-weight:900;font-size:18px;letter-spacing:.04em}
    .hdr-name em{color:#2D5A7B;font-style:normal}
    .hdr-tag{font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:#9AA3AE;letter-spacing:.14em;text-transform:uppercase;margin-top:3px}
    .hdr-spacer{flex:1}
    .gauge{display:flex;align-items:center;gap:8px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#C8CFD8}
    .gauge-bar{width:110px;height:6px;background:#37414E;border-radius:3px;overflow:hidden}
    .gauge-fill{height:100%;background:var(--accent);transition:width .6s ease}
    .seg{display:flex;border:1px solid #46505D;border-radius:6px;overflow:hidden}
    .seg button{background:transparent;border:0;color:#AEB6C0;font-family:'IBM Plex Mono',monospace;font-size:11px;padding:6px 12px;cursor:pointer;letter-spacing:.05em}
    .seg button.on{background:var(--accent);color:#fff;font-weight:600}
    .hbtn{background:#2C3947;border:1px solid #46505D;color:#EDEAE2;font-family:'IBM Plex Mono',monospace;font-size:11px;padding:7px 12px;border-radius:6px;cursor:pointer;letter-spacing:.04em}
    .hbtn:hover{border-color:var(--accent)}
    .hbtn.copied{background:var(--ok);border-color:var(--ok)}
    .hbtn.back{font-size:15px;padding:6px 11px;font-weight:700}
    .linkbtn{background:none;border:0;color:var(--accent);font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;padding:0;text-decoration:underline}
    .linkbtn:hover{color:#fff}
    .main{flex:1;display:flex;min-height:0}
    .chatpane{min-width:280px;display:flex;flex-direction:column;background:var(--ink);color:#E8E5DD}
    .docpane{flex:1;overflow-y:auto;padding:26px 30px;background:var(--paper)}
    .tabs{display:none}
    @media(max-width:900px){
      .tabs{display:flex;background:var(--ink2)}
      .tabs button{flex:1;background:transparent;border:0;color:#AEB6C0;padding:10px;font-family:'IBM Plex Mono',monospace;font-size:12px;cursor:pointer;border-bottom:2px solid transparent}
      .tabs button.on{color:#fff;border-bottom-color:var(--accent)}
      .chatpane{width:100%}
      .chatpane.hide,.docpane.hide{display:none}
      .docpane{padding:16px}
    }
    .msgs{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px}
    .msg{max-width:92%;padding:13px 16px;border-radius:10px;font-size:15.5px;line-height:1.6;white-space:pre-wrap}
    .msg.assistant{background:var(--ink3);align-self:flex-start}
    .msg.user{background:#3D4A59;align-self:flex-end;border-bottom-right-radius:2px}
    .msg img{max-width:200px;border-radius:6px;display:block;margin-bottom:6px}
    .typing{align-self:flex-start;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8C95A1;padding:6px 14px;letter-spacing:.1em}
    .typing::after{content:'▮';animation:blink 1s steps(1) infinite;color:var(--accent)}
    @keyframes blink{50%{opacity:0}}
    .composer{padding:12px 14px 14px;border-top:1px solid #303B49;display:flex;flex-direction:column;gap:8px}
    .imgchip{display:flex;align-items:center;gap:8px;background:#2C3947;border:1px solid #46505D;border-radius:6px;padding:5px 9px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#C8CFD8;align-self:flex-start}
    .imgchip button{background:none;border:0;color:var(--accent);cursor:pointer;font-size:13px}
    .row{display:flex;gap:8px}
    .row textarea{flex:1;background:#222C39;border:1px solid #3B4654;border-radius:8px;color:#EDEAE2;padding:10px 12px;font-family:'Archivo',sans-serif;font-size:15px;resize:vertical;min-height:46px;max-height:340px;line-height:1.5}
    .row textarea:focus{outline:2px solid var(--accent);outline-offset:-1px}
    .send{background:var(--accent);border:0;color:#fff;font-weight:700;border-radius:8px;padding:0 18px;cursor:pointer;font-size:14px}
    .send:disabled{opacity:.4;cursor:default}
    .tools{display:flex;gap:8px;flex-wrap:wrap}
    .tool{background:transparent;border:1px dashed #4A5563;color:#AEB6C0;border-radius:6px;padding:6px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;cursor:pointer;letter-spacing:.03em}
    .tool:hover{border-color:var(--accent);color:#fff}
    .doc{background:var(--card);border:1px solid var(--line2);box-shadow:0 1px 0 var(--line2),0 14px 34px rgba(28,33,40,.10);max-width:880px;margin:0 auto}
    .fld{padding:7px 0;border-bottom:1px dotted var(--line);cursor:text;position:relative}
    .fld:hover:not(.editing){background:rgba(232,89,12,.05)}
    .fld:last-child{border-bottom:0}
    .fld-pen{opacity:0;margin-left:6px;color:var(--accent);font-size:10px;transition:opacity .15s}
    .fld:hover .fld-pen{opacity:1}
    .fld-edit{width:100%;border:1.5px solid var(--accent);background:#FFF9F4;padding:8px 10px;font-family:'Archivo',sans-serif;font-size:13.5px;line-height:1.5;resize:vertical}
    .fld-edit:focus{outline:none}
    .fld-edit-hint{font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:.08em;margin-top:3px;text-transform:uppercase}
    .fld.editing .fld-label{color:var(--accent)}
    .fld-label{font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:3px}
    .fld-value{font-size:13.5px;line-height:1.5;white-space:pre-wrap}
    .fld.empty .fld-value{color:#B9B3A4;font-style:italic;font-size:12.5px}
    .fld.pending .fld-value{color:var(--amber);font-weight:500}
    .fld.fresh{animation:stamp 2.4s ease-out}
    @keyframes stamp{0%{background:rgba(232,89,12,.22);box-shadow:inset 3px 0 0 var(--accent)}100%{background:transparent}}
    .vda{padding:34px 38px}
    .doc-head{display:flex;justify-content:space-between;gap:24px;border-bottom:3px solid var(--ink);padding-bottom:18px;margin-bottom:8px;flex-wrap:wrap}
    .doc-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
    .doc-title{font-weight:900;font-size:30px;letter-spacing:-.01em;color:var(--ink)}
    .doc-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 26px;min-width:340px;flex:1;max-width:480px}
    .dsec{display:flex;border-bottom:1px solid var(--line);padding:14px 0}
    .dsec:last-of-type{border-bottom:3px solid var(--ink)}
    .dsec-head{width:150px;flex-shrink:0;padding-right:16px}
    .dnum{display:inline-block;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:13px;color:#fff;background:var(--ink);padding:3px 8px;margin-bottom:6px}
    .dtitle{display:block;font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--ink);line-height:1.3}
    .dsec-body{flex:1}
    .doc-foot{font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:var(--muted);letter-spacing:.1em;padding-top:14px;text-transform:uppercase}
    @media(max-width:900px){.vda{padding:20px}.dsec{flex-direction:column}.dsec-head{width:auto;margin-bottom:8px;display:flex;align-items:center;gap:8px}.dtitle{display:inline}}
    .oem{padding:0 0 20px}
    .oem-band{display:flex;align-items:center;gap:14px;background:var(--ink);color:#fff;padding:14px 20px}
    .oem-logo{font-weight:900;font-size:15px;border:2px solid #fff;padding:4px 8px;letter-spacing:.08em}
    .oem-band-title{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.1em;flex:1}
    .oem-claim{font-family:'IBM Plex Mono',monospace;font-size:11px;text-align:right}
    .oem-claim span{display:block;font-size:9px;color:#9AA3AE;letter-spacing:.12em}
    .oem-grid{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:2px solid var(--ink)}
    .oem-cell{border-right:1px solid var(--line);border-top:1px solid var(--line);padding:6px 14px}
    .oem-cell:nth-child(3n){border-right:0}
    .oem-cols{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:16px}
    .oem-box{border:1.5px solid var(--ink);margin-bottom:14px;padding:10px 14px 12px}
    .oem-box.urgent{border-color:var(--accent);box-shadow:inset 0 3px 0 var(--accent)}
    .oem-box-h{font-family:'IBM Plex Mono',monospace;font-size:10.5px;font-weight:600;letter-spacing:.1em;color:var(--ink);border-bottom:1px solid var(--line);padding-bottom:6px;margin-bottom:4px}
    .oem-box.urgent .oem-box-h{color:var(--accent)}
    @media(max-width:900px){.oem-cols{grid-template-columns:1fr}.oem-grid{grid-template-columns:1fr 1fr}}
    .overlay{position:fixed;inset:0;background:rgba(15,19,25,.66);display:flex;align-items:center;justify-content:center;z-index:50;padding:16px}
    .modal{background:var(--card);border-top:4px solid var(--accent);max-width:560px;width:100%;padding:22px}
    .modal h3{font-size:16px;font-weight:900;margin-bottom:4px}
    .modal p{font-size:12.5px;color:var(--muted);margin-bottom:12px}
    .modal textarea{width:100%;min-height:180px;border:1px solid var(--line2);padding:10px;font-family:'IBM Plex Mono',monospace;font-size:12px;resize:vertical}
    .modal textarea:focus{outline:2px solid var(--accent)}
    .modal-row{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}
    .btn-sec{background:transparent;border:1px solid var(--line2);padding:8px 14px;cursor:pointer;font-family:'Archivo',sans-serif;font-size:13px}
    .btn-pri{background:var(--accent);border:0;color:#fff;font-weight:700;padding:8px 16px;cursor:pointer;font-family:'Archivo',sans-serif;font-size:13px}
    .picker{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;padding:30px;background:var(--ink)}
    .picker-brand{text-align:center;color:#EDEAE2}
    .picker-brand .hdr-name{font-size:30px}
    .picker-brand .hdr-tag{margin-top:6px}
    .picker-q{font-family:'IBM Plex Mono',monospace;font-size:12px;color:#9AA3AE;letter-spacing:.14em;text-transform:uppercase}
    .cards{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;max-width:1240px}
    .card{width:270px;background:var(--card);border-top:4px solid var(--accent);padding:20px;cursor:pointer;text-align:left;border-right:1px solid var(--line2);border-bottom:1px solid var(--line2);border-left:1px solid var(--line2);transition:transform .12s ease, box-shadow .12s ease}
    .card{cursor:pointer}
    .card:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(0,0,0,.30);border-color:var(--accent)}
    .card-code{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.14em;color:var(--accent);text-transform:uppercase;margin-bottom:8px}
    .card-title{font-weight:900;font-size:20px;color:var(--ink);margin-bottom:10px;line-height:1.15;letter-spacing:-.01em}
    .card-desc{font-size:12.5px;color:#5C594F;line-height:1.5}
    .gate{flex:1;display:flex;align-items:center;justify-content:center;background:var(--ink);padding:20px}
    .gate-box{width:340px;background:var(--card);border-top:4px solid var(--accent);padding:26px}
    .gate-box h2{font-weight:900;font-size:20px;color:var(--ink)}
    .gate-box h2 em{color:#2D5A7B;font-style:normal}
    .gate-box p{font-size:12px;color:var(--muted);margin:6px 0 16px}
    .gate-box input{width:100%;border:1px solid var(--line2);padding:10px 12px;font-family:'IBM Plex Mono',monospace;font-size:14px;letter-spacing:.1em}
    .gate-box input:focus{outline:2px solid var(--accent)}
    .gate-err{color:#B3261E;font-size:11.5px;margin-top:8px;font-family:'IBM Plex Mono',monospace}
    .gate-btn{width:100%;margin-top:14px;background:var(--accent);border:0;color:#fff;font-weight:700;padding:11px;cursor:pointer;font-size:14px;font-family:'Archivo',sans-serif}
    .gate-btn:disabled{opacity:.5}
    .gate-note{font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:.08em;margin-top:12px;text-transform:uppercase;line-height:1.6}
    @media print{
      .hdr,.chatpane,.tabs{display:none!important}
      .app{height:auto}
      .docpane{overflow:visible;padding:0}
      .doc{box-shadow:none;border:0;max-width:100%}
      .fld.empty{display:none}
      .fld-pen{display:none}
    }
  
    /* ---- Selector de organización ---- */
    .org-list{display:flex;flex-direction:column;gap:8px;margin:6px 0 14px}
    .org-item{display:flex;justify-content:space-between;align-items:center;background:var(--paper);border:1px solid var(--line2);padding:12px 14px;cursor:pointer;text-align:left;font-family:'Archivo',sans-serif}
    .org-item:hover{border-color:var(--accent)}
    .org-name{font-weight:700;font-size:14px;color:var(--ink)}
    .org-rol{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
    .gate-switch{font-size:12px;color:var(--muted);margin-top:14px;text-align:center}
    .gate-switch button{background:none;border:0;color:var(--accent);cursor:pointer;text-decoration:underline;font-size:12px}
    .linkbtn2{background:none;border:0;color:var(--muted);cursor:pointer;text-decoration:underline;font-size:12px;font-family:'Archivo',sans-serif;margin-top:6px}
    .linkbtn2:hover{color:var(--accent)}
    .admin-fab{position:fixed;bottom:18px;right:18px;background:var(--ink);color:#fff;border:1px solid var(--accent);border-radius:8px;padding:10px 16px;cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:12px;z-index:40}
    /* ---- Admin panel ---- */
    .modal.admin{max-width:520px}
    .admin-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
    .admin-block{border-top:1px solid var(--line);padding:14px 0}
    .admin-block-h{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
    .admin-row{display:flex;gap:8px}
    .admin-row input{flex:1}
    .admin-col{display:flex;flex-direction:column;gap:8px}
    .admin-col input,.admin-col select,.admin-row input{border:1px solid var(--line2);padding:9px 11px;font-family:'Archivo',sans-serif;font-size:13px}
    .admin-orglist{display:flex;flex-wrap:wrap;gap:6px}
    .admin-orgitem{background:var(--paper);border:1px solid var(--line2);padding:4px 10px;font-size:12px}
    .admin-empty{font-size:12px;color:var(--muted);font-style:italic}
    .admin-msg{margin-top:10px;font-size:12px;padding:8px 10px}
    .admin-msg.ok{background:#E8F3EC;color:var(--ok)}
    .admin-msg.err{background:#FBEAE8;color:#B3261E}
    /* ---- Top bar workspace ---- */
    .ws-org{display:flex;align-items:center;gap:8px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#C8CFD8}
    .ws-org strong{color:#fff;font-weight:600;letter-spacing:.02em}
    /* ---- Lista de expedientes + dashboard ---- */
    .home{flex:1;overflow-y:auto;padding:24px 30px;background:var(--paper)}
    .home-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px;flex-wrap:wrap;gap:12px}
    .home-title{font-weight:900;font-size:24px;color:var(--ink)}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}
    .kpi{background:var(--card);border:1px solid var(--line2);border-top:3px solid var(--accent);padding:16px}
    .kpi-num{font-weight:900;font-size:30px;color:var(--ink);line-height:1}
    .kpi-num.alert{color:#B3261E}
    .kpi-lbl{font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:6px}
    .breakdowns{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:22px}
    .bd{background:var(--card);border:1px solid var(--line2);padding:14px 16px}
    .bd-h{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
    .bar-row{display:flex;align-items:center;gap:8px;margin-bottom:7px;font-size:12px}
    .bar-label{width:130px;flex-shrink:0;color:var(--txt)}
    .bar-track{flex:1;height:14px;background:var(--paper);border:1px solid var(--line)}
    .bar-fill{height:100%;background:var(--accent)}
    .bar-val{width:28px;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--muted)}
    .exp-table{background:var(--card);border:1px solid var(--line2);width:100%;border-collapse:collapse}
    .exp-table th{font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);text-align:left;padding:10px 12px;border-bottom:2px solid var(--ink)}
    .exp-table td{padding:10px 12px;border-bottom:1px solid var(--line);font-size:13px;cursor:pointer}
    .exp-table tr:hover td{background:rgba(232,89,12,.05)}
    .pill{display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.06em;text-transform:uppercase;padding:3px 7px;border-radius:3px}
    .pill.abierto{background:#FEF0E6;color:var(--accent)}
    .pill.en_curso{background:#FFF4D6;color:var(--amber)}
    .pill.cerrado{background:#E8F3EC;color:var(--ok)}
    .dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
    .dot.red{background:#B3261E}.dot.amber{background:var(--amber)}.dot.green{background:var(--ok)}.dot.grey{background:#B9B3A4}
    .new-btn{background:var(--accent);border:0;color:#fff;font-weight:700;padding:10px 16px;cursor:pointer;font-family:'Archivo',sans-serif;font-size:13px}
    .empty-home{text-align:center;color:var(--muted);padding:50px 20px;font-size:14px}
    @media(max-width:760px){.kpis{grid-template-columns:1fr 1fr}.breakdowns{grid-template-columns:1fr}.bar-label{width:90px}}
    .estado-sel{background:#2C3947;border:1px solid #46505D;color:#EDEAE2;font-family:'IBM Plex Mono',monospace;font-size:11px;padding:6px 10px;border-radius:6px;cursor:pointer}
    .unassigned{color:#B45309;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.04em;text-transform:uppercase;background:#FFF4D6;padding:2px 6px;border-radius:3px}
    .divider{flex:0 0 8px;background:var(--ink);cursor:col-resize;display:flex;align-items:center;justify-content:center;border-left:1px solid #303B49}
    .divider:hover{background:#222C39}
    .divider span{width:3px;height:42px;background:#46505D;border-radius:2px}
    .divider:hover span{background:var(--accent)}
    @media(max-width:900px){.divider{display:none}.chatpane{width:100%!important}}
    .picker-sub{font-size:13px;color:#9AA3AE;margin-top:-14px;margin-bottom:6px;max-width:420px;text-align:center;line-height:1.5}
    .card-desc{min-height:0}
    .card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}
    .card-badge{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--paper);border:1px solid var(--line2);padding:4px 9px;border-radius:4px}
    .card-arrow{font-size:18px;color:var(--accent);transition:transform .15s}
    .card:hover .card-arrow{transform:translateX(4px)}
    .new-btn.ghost{background:transparent;color:var(--ink);border:1px solid var(--line2)}
    .new-btn.ghost:hover{border-color:var(--accent)}
    .trend-note{background:#FFF4D6;border:1px solid #E8D9A8;color:#7A5B00;font-size:13px;padding:12px 16px;border-radius:10px;margin-bottom:18px;line-height:1.5}
    .tl-legend{display:flex;gap:18px;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
    .tl-legend span{display:flex;align-items:center;gap:6px}
    .tl-legend .sw{width:11px;height:11px;border-radius:2px;display:inline-block}
    .sw.open{background:var(--accent)} .sw.close{background:#2E7D54}
    .tl-chart{display:flex;align-items:flex-end;gap:14px;height:160px;padding-top:8px}
    .tl-col{flex:1;display:flex;flex-direction:column;align-items:center;height:100%}
    .tl-bars{flex:1;display:flex;align-items:flex-end;gap:4px;width:100%;justify-content:center}
    .tl-bar{width:38%;min-height:2px;border-radius:3px 3px 0 0;transition:height .4s ease}
    .tl-bar.open{background:var(--accent)} .tl-bar.close{background:#2E7D54}
    .tl-lbl{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--muted);text-transform:uppercase;margin-top:8px}
    .review-block{background:var(--card);border:1px solid var(--line2);border-radius:14px;padding:22px 24px;margin-top:8px}
    .review-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap}
    .review-sub{font-size:12.5px;color:var(--muted);line-height:1.5}
    .review-out{margin-top:18px;border-top:1px solid var(--line);padding-top:18px}
    .review-text{font-size:14px;line-height:1.7;color:var(--txt);white-space:pre-wrap}
    .hbtn-light{margin-top:14px;background:var(--ink);color:#fff;border:0;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.06em;padding:8px 14px;border-radius:6px;cursor:pointer}
    .hbtn-light:hover{background:#2c333b}
    .ev-panel{margin-top:18px;border-top:2px solid var(--ink);padding-top:16px}
    .ev-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
    .ev-title{font-weight:900;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink)}
    .ev-add{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.04em;background:var(--ink);color:#fff;padding:7px 12px;border-radius:6px;cursor:pointer;white-space:nowrap}
    .ev-add:hover{background:#2c333b}
    .ev-hint{font-size:11px;color:var(--muted);margin-bottom:12px}
    .ev-err{font-size:12px;color:#B42318;background:#FEF3F2;border:1px solid #FECDCA;padding:8px 10px;border-radius:6px;margin-bottom:10px}
    .ev-empty{font-size:13px;color:var(--muted);padding:10px 0}
    .ev-list{display:flex;flex-direction:column;gap:8px}
    .ev-item{display:flex;align-items:center;gap:10px;background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:9px 11px}
    .ev-ico{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:700;letter-spacing:.04em;color:#fff;background:#7A8794;border-radius:4px;padding:5px 6px;min-width:34px;text-align:center}
    .ev-ico.pdf{background:#C0392B} .ev-ico.doc{background:#2B579A} .ev-ico.xls{background:#1E7145} .ev-ico.img{background:#7A5BA6}
    .ev-meta{flex:1;display:flex;flex-direction:column;min-width:0}
    .ev-name{font-size:13px;color:var(--ink);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ev-size{font-size:11px;color:var(--muted)}
    .ev-btn{background:transparent;border:1px solid var(--line2);color:var(--ink);width:30px;height:30px;border-radius:6px;cursor:pointer;font-size:14px;flex-shrink:0}
    .ev-btn:hover{border-color:var(--accent)} .ev-btn.del:hover{border-color:#B42318;color:#B42318}
`;
