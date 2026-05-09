"use client";
import { useState } from "react";
const T = {
  fr: { title:"Conformite legale", sub:"automatique", desc:"Uploadez un document juridique. Notre IA detecte les risques en 2 secondes.", try:"Essayer gratuitement", analyze:"Analyser un document", back:"Retour", analyzing:"Analyse en cours...", drop:"Glissez votre PDF ici", or:"ou cliquez pour choisir", result:"Resultat", risks:"Risques detectes", suggestions:"Suggestions", domains:"Scores par domaine", another:"Analyser un autre document", conformLabel:["Non conforme","Partiel","Conforme"] },
  en: { title:"Legal compliance", sub:"automated", desc:"Upload any legal document. Our AI detects risks in 2 seconds.", try:"Try for free", analyze:"Analyze a document", back:"Back", analyzing:"Analyzing...", drop:"Drop your PDF here", or:"or click to choose", result:"Result", risks:"Detected risks", suggestions:"Suggestions", domains:"Domain scores", another:"Analyze another document", conformLabel:["Non-compliant","Partial","Compliant"] },
  es: { title:"Conformidad legal", sub:"automatica", desc:"Sube cualquier documento juridico. Nuestra IA detecta riesgos en 2 segundos.", try:"Probar gratis", analyze:"Analizar documento", back:"Volver", analyzing:"Analizando...", drop:"Arrastra tu PDF aqui", or:"o haz clic para elegir", result:"Resultado", risks:"Riesgos detectados", suggestions:"Sugerencias", domains:"Puntuacion por dominio", another:"Analizar otro documento", conformLabel:["No conforme","Parcial","Conforme"] },
  ar: { title:"الامتثال القانوني", sub:"التلقائي", desc:"ارفع اي وثيقة قانونية. يكتشف الذكاء الاصطناعي المخاطر في ثانيتين.", try:"جرب مجانا", analyze:"تحليل وثيقة", back:"رجوع", analyzing:"جاري التحليل...", drop:"اسقط ملف PDF هنا", or:"او انقر للاختيار", result:"النتيجة", risks:"المخاطر المكتشفة", suggestions:"الاقتراحات", domains:"النقاط حسب المجال", another:"تحليل وثيقة اخرى", conformLabel:["غير ممتثل","جزئي","ممتثل"] },
};
const LANGS = [{code:"fr",flag:"🇫🇷"},{code:"en",flag:"🇬🇧"},{code:"es",flag:"🇪🇸"},{code:"ar",flag:"🇸🇦"}];
export default function Home() {
  const [lang, setLang] = useState("fr");
  const [started, setStarted] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const t = T[lang as keyof typeof T];
  async function analyser() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch("/api/analyze", { method: "POST", body: fd });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setResult(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  const sc = (s) => s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";
  const sl = (s) => t.conformLabel[s >= 75 ? 2 : s >= 50 ? 1 : 0];
  const LangBar = () => (
    <div style={{display:"flex",gap:4}}>
      {LANGS.map(l => (
        <button key={l.code} onClick={()=>setLang(l.code)} style={{background:lang===l.code?"rgba(99,102,241,0.3)":"rgba(255,255,255,0.06)",border:lang===l.code?"1px solid rgba(99,102,241,0.5)":"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:16,transition:"all 0.2s"}}>
          {l.flag}
        </button>
      ))}
    </div>
  );
  if (started) return (
    <main style={{minHeight:"100vh",background:"#080c14",padding:"32px 16px",display:"flex",flexDirection:"column",alignItems:"center",fontFamily:"system-ui,sans-serif",direction:lang==="ar"?"rtl":"ltr"}}>
      <div style={{width:"100%",maxWidth:560,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
        <button onClick={()=>{setStarted(false);setResult(null);setFile(null);}} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:14}}>← {t.back}</button>
        <LangBar/>
      </div>
      <div style={{width:"100%",maxWidth:560}}>
        <h1 style={{color:"#f1f5f9",fontSize:28,fontWeight:700,marginBottom:16}}>{t.analyze}</h1>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:24,marginBottom:16}}>
          <div
            onDragOver={(e)=>{e.preventDefault();setDragging(true);}}
            onDragLeave={()=>setDragging(false)}
            onDrop={(e)=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files[0];if(f?.type==="application/pdf")setFile(f);}}
            onClick={()=>document.getElementById("fileinput").click()}
            style={{border:`2px dashed ${dragging?"#6366f1":file?"#22c55e":"rgba(255,255,255,0.15)"}`,borderRadius:12,padding:"32px 24px",textAlign:"center",cursor:"pointer",background:dragging?"rgba(99,102,241,0.08)":file?"rgba(34,197,94,0.05)":"rgba(255,255,255,0.02)",transition:"all 0.2s"}}
          >
            <div style={{fontSize:40,marginBottom:12}}>{file?"✅":"📄"}</div>
            {file ? (
              <div>
                <p style={{color:"#22c55e",fontSize:14,fontWeight:500}}>{file.name}</p>
                <p style={{color:"#475569",fontSize:12,marginTop:4}}>{(file.size/1024).toFixed(0)} KB</p>
              </div>
            ) : (
              <div>
                <p style={{color:"#94a3b8",fontSize:14,fontWeight:500,marginBottom:4}}>{t.drop}</p>
                <p style={{color:"#475569",fontSize:13}}>{t.or}</p>
              </div>
            )}
          </div>
          <input id="fileinput" type="file" accept=".pdf" onChange={(e)=>setFile(e.target.files[0]??null)} style={{display:"none"}}/>
          <button onClick={analyser} disabled={!file||loading} style={{width:"100%",marginTop:16,padding:"14px 0",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"white",border:"none",borderRadius:10,fontSize:14,fontWeight:500,cursor:"pointer",opacity:!file||loading?0.5:1,transition:"opacity 0.2s"}}>
            {loading ? "⏳ "+t.analyzing : t.analyze+" →"}
          </button>
          {error && <p style={{color:"#ef4444",fontSize:13,marginTop:8}}>{error}</p>}
        </div>
        {result && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:24,display:"flex",gap:20,alignItems:"center"}}>
              <div style={{textAlign:"center",minWidth:80}}>
                <span style={{fontSize:52,fontWeight:800,color:sc(result.score_global),display:"block"}}>{result.score_global}</span>
                <span style={{fontSize:11,padding:"2px 10px",borderRadius:99,background:sc(result.score_global)+"22",color:sc(result.score_global),display:"inline-block",marginTop:4,border:"1px solid "+sc(result.score_global)+"44"}}>{sl(result.score_global)}</span>
              </div>
              <div style={{flex:1}}>
                <p style={{color:"#94a3b8",fontSize:13,marginBottom:4}}>{result.domaine_principal}</p>
                <p style={{color:"#cbd5e1",fontSize:13,lineHeight:1.6}}>{result.resume_executif}</p>
              </div>
            </div>
            {result.scores_domaines && (
              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:24}}>
                <p style={{color:"#475569",fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>{t.domains}</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {Object.entries(result.scores_domaines).filter(([,v])=>v!==null).map(([k,v],i)=>(
                    <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px 14px",display:"flex",justifyContent:"space-between",border:"1px solid rgba(255,255,255,0.06)"}}>
                      <span style={{fontSize:13,color:"#94a3b8"}}>{k.replace("_"," ")}</span>
                      <span style={{fontSize:16,fontWeight:700,color:sc(v)}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:24}}>
              <p style={{color:"#475569",fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>{t.risks}</p>
              {result.risques?.map((r,i)=>(
                <div key={i} style={{marginBottom:8,padding:"12px",background:"rgba(255,255,255,0.02)",borderRadius:8,border:"1px solid rgba(255,255,255,0.05)"}}>
                  <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:"rgba(239,68,68,0.15)",color:"#fca5a5",border:"1px solid rgba(239,68,68,0.3)"}}>{r.niveau}</span>
                    {r.reference_legale && <span style={{fontSize:11,color:"#818cf8",fontWeight:500}}>{r.reference_legale}</span>}
                  </div>
                  <p style={{fontSize:13,color:"#cbd5e1",marginBottom:r.impact?4:0}}>{r.description}</p>
                  {r.impact && <p style={{fontSize:12,color:"#475569"}}>Impact : {r.impact}</p>}
                </div>
              ))}
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:24}}>
              <p style={{color:"#475569",fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>{t.suggestions}</p>
              {result.suggestions?.map((s,i)=>(
                <div key={i} style={{marginBottom:8,padding:"12px",background:"rgba(255,255,255,0.02)",borderRadius:8,border:"1px solid rgba(255,255,255,0.05)"}}>
                  <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:"rgba(99,102,241,0.15)",color:"#a5b4fc",border:"1px solid rgba(99,102,241,0.3)"}}>{s.priorite}</span>
                    {s.reference_legale && <span style={{fontSize:11,color:"#818cf8",fontWeight:500}}>{s.reference_legale}</span>}
                  </div>
                  <p style={{fontSize:13,color:"#cbd5e1"}}>{s.action}</p>
                </div>
              ))}
            </div>
            <button onClick={()=>{setFile(null);setResult(null);}} style={{background:"none",border:"none",color:"#475569",fontSize:13,cursor:"pointer",textDecoration:"underline"}}>{t.another}</button>
          </div>
        )}
      </div>
    </main>
  );
  return (
    <main style={{minHeight:"100vh",background:"#080c14",fontFamily:"system-ui,sans-serif",direction:lang==="ar"?"rtl":"ltr"}}>
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 48px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <span style={{fontSize:20,fontWeight:800,color:"#f1f5f9"}}>Conformia</span>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          <LangBar/>
          <button onClick={()=>setStarted(true)} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"white",border:"none",padding:"10px 22px",borderRadius:10,cursor:"pointer",fontSize:14}}>{t.try}</button>
        </div>
      </nav>
      <section style={{textAlign:"center",padding:"100px 24px"}}>
        <h1 style={{fontSize:64,fontWeight:800,color:"#f1f5f9",lineHeight:1.1,marginBottom:24}}>{t.title}<br/><span style={{color:"#6366f1"}}>{t.sub}</span></h1>
        <p style={{fontSize:18,color:"#64748b",maxWidth:480,margin:"0 auto 40px",lineHeight:1.7}}>{t.desc}</p>
        <button onClick={()=>setStarted(true)} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"white",border:"none",padding:"16px 36px",borderRadius:12,fontSize:16,cursor:"pointer"}}>{t.analyze}</button>
      </section>
      <section style={{background:"rgba(255,255,255,0.02)",padding:"40px 24px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:800,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",textAlign:"center",gap:16}}>
          {[["10K+","Documents"],["98%","Precision"],["2 sec","Rapidite"],["RGPD","Couverture"]].map(([n,l],i)=>(
            <div key={i}><div style={{fontSize:32,fontWeight:800,color:"#f1f5f9"}}>{n}</div><div style={{fontSize:13,color:"#475569",marginTop:4}}>{l}</div></div>
          ))}
        </div>
      </section>
    </main>
  );
}

