import { useState, useRef, useCallback } from "react";
import DoctorMap from "./DoctorMap";

const translations = {
  en: {
    lang: "English",
    nav_home: "Home",
    nav_about: "About",
    nav_contact: "Contact",
    hero_tag: "AI-Powered Diagnosis",
    hero_title: "Osteoporosis",
    hero_title2: "Detection",
    hero_subtitle:
      "Upload your bone density scan or X-ray image and receive an instant AI-powered diagnosis report with detailed insights.",
    upload_title: "Upload Scan Image",
    upload_desc: "Drag & drop your X-ray or bone scan here",
    upload_or: "or",
    upload_btn: "Browse Files",
    upload_formats: "Supported: JPG, PNG, DICOM, PDF — Max 25MB",
    analyze_btn: "Analyze Scan",
    analyzing: "Analyzing...",
    result_title: "Diagnosis Report",
    result_confidence: "Confidence Score",
    result_risk: "Risk Level",
    result_recommendation: "Recommendation",
    features_title: "Why Choose OsteoAI?",
    feature1_title: "Instant Results",
    feature1_desc: "Get AI-powered analysis in under 30 seconds.",
    feature2_title: "High Accuracy",
    feature2_desc: "98.4% accuracy validated by medical professionals.",
    feature3_title: "Secure & Private",
    feature3_desc: "HIPAA compliant. Your data is never stored.",
    feature4_title: "Multilingual",
    feature4_desc: "Supports 4+ Indian languages for wider accessibility.",
    footer: "© 2025 OsteoAI. For diagnostic support only. Consult a physician.",
    drop_active: "Drop your file here!",
    file_selected: "File selected",
    no_file: "Please upload a scan image first.",
    risk_low: "Low Risk",
    risk_moderate: "Moderate Risk",
    risk_high: "High Risk",
    rec_low:
      "Maintain a calcium-rich diet and regular exercise. Annual check-up recommended.",
    rec_moderate:
      "Consult your physician for a detailed bone density test (DEXA scan).",
    rec_high:
      "Immediate consultation with an orthopedic specialist is strongly advised.",
  },
  hi: {
    lang: "हिंदी",
    nav_home: "होम",
    nav_about: "परिचय",
    nav_contact: "संपर्क",
    hero_tag: "AI-संचालित निदान",
    hero_title: "ऑस्टियोपोरोसिस",
    hero_title2: "डिटेक्शन",
    hero_subtitle:
      "अपनी हड्डी की स्कैन या एक्स-रे छवि अपलोड करें और तत्काल AI-संचालित निदान रिपोर्ट प्राप्त करें।",
    upload_title: "स्कैन छवि अपलोड करें",
    upload_desc: "अपना X-ray या बोन स्कैन यहाँ खींचें और छोड़ें",
    upload_or: "या",
    upload_btn: "फ़ाइल चुनें",
    upload_formats: "समर्थित: JPG, PNG, DICOM, PDF — अधिकतम 25MB",
    analyze_btn: "स्कैन विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    result_title: "निदान रिपोर्ट",
    result_confidence: "विश्वास स्कोर",
    result_risk: "जोखिम स्तर",
    result_recommendation: "सिफारिश",
    features_title: "OsteoAI क्यों चुनें?",
    feature1_title: "तत्काल परिणाम",
    feature1_desc: "30 सेकंड में AI विश्लेषण प्राप्त करें।",
    feature2_title: "उच्च सटीकता",
    feature2_desc: "98.4% सटीकता, चिकित्सकों द्वारा सत्यापित।",
    feature3_title: "सुरक्षित और निजी",
    feature3_desc: "HIPAA अनुपालित। आपका डेटा कभी संग्रहीत नहीं।",
    feature4_title: "बहुभाषी",
    feature4_desc: "व्यापक पहुँच के लिए 4+ भारतीय भाषाएँ।",
    footer:
      "© 2025 OsteoAI। केवल नैदानिक सहायता के लिए। डॉक्टर से परामर्श करें।",
    drop_active: "यहाँ फ़ाइल छोड़ें!",
    file_selected: "फ़ाइल चुनी गई",
    no_file: "कृपया पहले स्कैन छवि अपलोड करें।",
    risk_low: "कम जोखिम",
    risk_moderate: "मध्यम जोखिम",
    risk_high: "उच्च जोखिम",
    rec_low: "कैल्शियम युक्त आहार और नियमित व्यायाम जारी रखें।",
    rec_moderate: "विस्तृत हड्डी घनत्व परीक्षण के लिए अपने डॉक्टर से मिलें।",
    rec_high: "तुरंत हड्डी विशेषज्ञ से परामर्श लें।",
  },
  mr: {
    lang: "मराठी",
    nav_home: "मुखपृष्ठ",
    nav_about: "परिचय",
    nav_contact: "संपर्क",
    hero_tag: "AI-चालित निदान",
    hero_title: "ऑस्टिओपोरोसिस",
    hero_title2: "शोध",
    hero_subtitle:
      "तुमची हाडांची स्कॅन किंवा एक्स-रे प्रतिमा अपलोड करा आणि तत्काळ AI-चालित निदान अहवाल मिळवा।",
    upload_title: "स्कॅन प्रतिमा अपलोड करा",
    upload_desc: "तुमचा X-ray किंवा बोन स्कॅन येथे ड्रॅग करा",
    upload_or: "किंवा",
    upload_btn: "फाइल निवडा",
    upload_formats: "समर्थित: JPG, PNG, DICOM, PDF — कमाल 25MB",
    analyze_btn: "स्कॅन विश्लेषण करा",
    analyzing: "विश्लेषण होत आहे...",
    result_title: "निदान अहवाल",
    result_confidence: "विश्वास स्कोर",
    result_risk: "जोखीम पातळी",
    result_recommendation: "शिफारस",
    features_title: "OsteoAI का निवडावे?",
    feature1_title: "तत्काळ निकाल",
    feature1_desc: "30 सेकंदात AI विश्लेषण मिळवा।",
    feature2_title: "उच्च अचूकता",
    feature2_desc: "98.4% अचूकता, वैद्यकीय तज्ञांनी प्रमाणित।",
    feature3_title: "सुरक्षित आणि खाजगी",
    feature3_desc: "HIPAA अनुपालित। तुमचा डेटा कधीही साठवला जात नाही।",
    feature4_title: "बहुभाषिक",
    feature4_desc: "व्यापक प्रवेशासाठी 4+ भारतीय भाषा।",
    footer: "© 2025 OsteoAI। केवळ निदान सहाय्यासाठी। डॉक्टरांचा सल्ला घ्या।",
    drop_active: "येथे फाइल सोडा!",
    file_selected: "फाइल निवडली",
    no_file: "कृपया आधी स्कॅन प्रतिमा अपलोड करा।",
    risk_low: "कमी जोखीम",
    risk_moderate: "मध्यम जोखीम",
    risk_high: "उच्च जोखीम",
    rec_low: "कॅल्शियमयुक्त आहार आणि नियमित व्यायाम सुरू ठेवा।",
    rec_moderate: "तपशीलवार हाड घनता चाचणीसाठी डॉक्टरांना भेटा।",
    rec_high: "हाड तज्ञाशी त्वरित सल्लामसलत करा।",
  },
  kn: {
    lang: "ಕನ್ನಡ",
    nav_home: "ಮುಖಪುಟ",
    nav_about: "ಪರಿಚಯ",
    nav_contact: "ಸಂಪರ್ಕ",
    hero_tag: "AI-ಚಾಲಿತ ರೋಗನಿರ್ಣಯ",
    hero_title: "ಆಸ್ಟಿಯೊಪೊರೊಸಿಸ್",
    hero_title2: "ಪತ್ತೆ",
    hero_subtitle:
      "ನಿಮ್ಮ ಮೂಳೆ ಸ್ಕ್ಯಾನ್ ಅಥವಾ X-ರೇ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ತಕ್ಷಣದ AI ರೋಗನಿರ್ಣಯ ವರದಿ ಪಡೆಯಿರಿ.",
    upload_title: "ಸ್ಕ್ಯಾನ್ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    upload_desc: "ನಿಮ್ಮ X-ರೇ ಅಥವಾ ಮೂಳೆ ಸ್ಕ್ಯಾನ್ ಇಲ್ಲಿ ಎಳೆದು ಬಿಡಿ",
    upload_or: "ಅಥವಾ",
    upload_btn: "ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಿ",
    upload_formats: "ಬೆಂಬಲಿತ: JPG, PNG, DICOM, PDF — ಗರಿಷ್ಠ 25MB",
    analyze_btn: "ಸ್ಕ್ಯಾನ್ ವಿಶ್ಲೇಷಿಸಿ",
    analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    result_title: "ರೋಗನಿರ್ಣಯ ವರದಿ",
    result_confidence: "ವಿಶ್ವಾಸ ಸ್ಕೋರ್",
    result_risk: "ಅಪಾಯದ ಮಟ್ಟ",
    result_recommendation: "ಶಿಫಾರಸು",
    features_title: "OsteoAI ಅನ್ನು ಏಕೆ ಆರಿಸಬೇಕು?",
    feature1_title: "ತಕ್ಷಣದ ಫಲಿತಾಂಶ",
    feature1_desc: "30 ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ AI ವಿಶ್ಲೇಷಣೆ ಪಡೆಯಿರಿ.",
    feature2_title: "ಹೆಚ್ಚಿನ ನಿಖರತೆ",
    feature2_desc: "98.4% ನಿಖರತೆ, ವೈದ್ಯರಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.",
    feature3_title: "ಸುರಕ್ಷಿತ & ಖಾಸಗಿ",
    feature3_desc: "HIPAA ಅನುಸರಣೆ. ನಿಮ್ಮ ಡೇಟಾ ಎಂದಿಗೂ ಸಂಗ್ರಹಿಸಲ್ಪಡುವುದಿಲ್ಲ.",
    feature4_title: "ಬಹುಭಾಷಿಕ",
    feature4_desc: "ವ್ಯಾಪಕ ಪ್ರವೇಶಕ್ಕಾಗಿ 4+ ಭಾರತೀಯ ಭಾಷೆಗಳು.",
    footer: "© 2025 OsteoAI. ರೋಗನಿರ್ಣಯ ಸಹಾಯಕ್ಕಾಗಿ ಮಾತ್ರ. ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    drop_active: "ಇಲ್ಲಿ ಫೈಲ್ ಬಿಡಿ!",
    file_selected: "ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ",
    no_file: "ದಯವಿಟ್ಟು ಮೊದಲು ಸ್ಕ್ಯಾನ್ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    risk_low: "ಕಡಿಮೆ ಅಪಾಯ",
    risk_moderate: "ಮಧ್ಯಮ ಅಪಾಯ",
    risk_high: "ಹೆಚ್ಚಿನ ಅಪಾಯ",
    rec_low: "ಕ್ಯಾಲ್ಸಿಯಂ ಸಮೃದ್ಧ ಆಹಾರ ಮತ್ತು ನಿಯಮಿತ ವ್ಯಾಯಾಮ ಮುಂದುವರಿಸಿ.",
    rec_moderate: "ವಿವರವಾದ ಮೂಳೆ ಸಾಂದ್ರತೆ ಪರೀಕ್ಷೆಗಾಗಿ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ.",
    rec_high: "ಅಸ್ಥಿ ತಜ್ಞರನ್ನು ತಕ್ಷಣ ಸಂಪರ್ಕಿಸಿ.",
  },
};

export default function HomePage() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState("en");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [osteo, setOsteo] = useState(false);
  const inputRef = useRef();
  const t = translations[lang];

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
      console.log(data);
      if (data.prediction == "Normal") {
        setOsteo(false);
      } else {
        setOsteo(true);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError("");
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);

  const bg = dark ? "bg-[#0a0e1a]" : "bg-slate-50";
  const text = dark ? "text-slate-100" : "text-slate-800";
  const cardBg = dark
    ? "bg-[#111827] border-slate-700/50"
    : "bg-white border-slate-200";
  const mutedText = dark ? "text-slate-400" : "text-slate-500";
  const navBg = dark
    ? "bg-[#0a0e1a]/80 border-slate-700/50"
    : "bg-white/80 border-slate-200";

  return (
    <div
      className={`min-h-screen w-full ${bg} ${text} font-sans transition-colors duration-300`}
      style={{
        fontFamily:
          "'Outfit', 'Noto Sans Devanagari', 'Noto Sans Kannada', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .gradient-text { background: linear-gradient(135deg, #60a5fa, #a78bfa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .bone-grid { background-image: radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px); background-size: 28px 28px; }
        .glow { box-shadow: 0 0 40px rgba(99,102,241,0.15), 0 0 80px rgba(99,102,241,0.05); }
        .upload-glow:hover { box-shadow: 0 0 30px rgba(99,102,241,0.25); }
        .pulse-ring { animation: pulseRing 2s ease-in-out infinite; }
        @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.05);opacity:1} }
        .slide-in { animation: slideIn 0.5s ease-out; }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .bar-fill { animation: barFill 1s ease-out forwards; }
        @keyframes barFill { from{width:0%} }
      `}</style>

      {/* NAV */}
      <nav
        className={`fixed top-0 w-full z-50 border-b backdrop-blur-xl ${navBg} transition-colors duration-300`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
              O
            </div>
            <span className="font-bold text-lg tracking-tight">OsteoAI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="hover:text-blue-400 transition-colors">
              {t.nav_home}
            </a>
            <a
              href="#features"
              className="hover:text-blue-400 transition-colors"
            >
              {t.nav_about}
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              {t.nav_contact}
            </a>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-colors ${dark ? "bg-slate-800 border-slate-600 text-slate-200" : "bg-white border-slate-300 text-slate-700"}`}
            >
              {Object.entries(translations).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.lang}
                </option>
              ))}
            </select>
            {/* Dark/Light Toggle */}
            <button
              onClick={() => setDark(!dark)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${dark ? "bg-slate-800 border-slate-600 text-yellow-400 hover:bg-slate-700" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"}`}
              title="Toggle theme"
            >
              {dark ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        className={`relative w-full pt-32 pb-16 overflow-hidden ${dark ? "bone-grid" : ""}`}
      >
        {dark && (
          <>
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-40 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          </>
        )}
        <div className="w-full mx-auto px-4 text-center relative z-10">
          <span
            className={`inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 border ${dark ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600"}`}
          >
            {t.hero_tag}
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-4">
            <span className="gradient-text">{t.hero_title}</span>
            <br />
            <span>{t.hero_title2}</span>
          </h1>
          <p
            className={`max-w-2xl mx-auto text-lg mt-6 leading-relaxed ${mutedText}`}
          >
            {t.hero_subtitle}
          </p>
        </div>
      </section>

      {/* UPLOAD + RESULT */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Card */}
          <div
            className={`rounded-2xl border p-6 ${cardBg} glow transition-all duration-300`}
          >
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </span>
              {t.upload_title}
            </h2>

            {/* Drop Zone */}
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => inputRef.current.click()}
              className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer min-h-[200px] flex flex-col items-center justify-center gap-3 upload-glow
                ${
                  dragging
                    ? "border-blue-400 bg-blue-500/10 scale-[1.01]"
                    : dark
                      ? "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
                      : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/50"
                }`}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.dcm"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {preview ? (
                <div className="w-full h-48 flex items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={preview}
                    alt="preview"
                    className="h-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <>
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center pulse-ring ${dark ? "bg-slate-700" : "bg-slate-100"}`}
                  >
                    <svg
                      className="w-7 h-7 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className={`font-medium text-sm ${mutedText}`}>
                    {dragging ? t.drop_active : t.upload_desc}
                  </p>
                </>
              )}
              {file && (
                <p className="text-xs font-medium text-blue-400 mt-1">
                  ✓ {t.file_selected}: {file.name}
                </p>
              )}
            </div>
            <p className={`text-xs mt-2 text-center ${mutedText}`}>
              {t.upload_or}
            </p>
            <button
              onClick={() => inputRef.current.click()}
              className={`w-full mt-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${dark ? "border-slate-600 hover:bg-slate-700 text-slate-300" : "border-slate-300 hover:bg-slate-100 text-slate-600"}`}
            >
              {t.upload_btn}
            </button>
            <p className={`text-xs mt-2 text-center ${mutedText}`}>
              {t.upload_formats}
            </p>

            {error && (
              <p className="mt-3 text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={() => handleUpload()}
              disabled={loading}
              className="w-full mt-5 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {t.analyzing}
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  {t.analyze_btn}
                </>
              )}
            </button>
          </div>

          {/* Result Card */}
          <div
            className={`rounded-2xl border p-6 ${cardBg} transition-all duration-300 ${result ? "slide-in" : ""}`}
          >
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              {t.result_title}
            </h2>

            {!result && !loading && (
              <div
                className={`h-64 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed ${dark ? "border-slate-700" : "border-slate-200"}`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${dark ? "bg-slate-800" : "bg-slate-100"}`}
                >
                  <svg
                    className={`w-8 h-8 ${mutedText}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className={`text-sm ${mutedText}`}>
                  Results will appear here
                </p>
              </div>
            )}

            {loading && (
              <div className="h-64 flex flex-col items-center justify-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 spin" />
                </div>
                <p className={`text-sm font-medium ${mutedText}`}>
                  {t.analyzing}
                </p>
                <div
                  className={`w-48 h-1.5 rounded-full overflow-hidden ${dark ? "bg-slate-700" : "bg-slate-200"}`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full bar-fill"
                    style={{ width: "70%" }}
                  />
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-5 slide-in">
                {/* Risk Badge */}
                <div className={`rounded-xl border p-4 ${result.bgColor}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${mutedText}`}
                    >
                      {result.prediction}
                    </span>
                    <span
                      className={`text-lg font-extrabold ${result.riskColor}`}
                    >
                      {result.prediction}
                    </span>
                  </div>
                  <div className={`text-xs ${mutedText} mt-1`}>
                    {result.prediction === "Normal"
                      ? `✓ ${result.message}`
                      : `⚠ ${result.message}`}
                  </div>
                </div>

                {/* Confidence */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${mutedText}`}>
                      {result.confidence * 100}
                    </span>
                    <span className="text-sm font-bold text-blue-400">
                      {result.confidence * 100}%
                    </span>
                  </div>
                  <div
                    className={`h-2 rounded-full overflow-hidden ${dark ? "bg-slate-700" : "bg-slate-200"}`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 bar-fill"
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                </div>

                {/* Recommendation */}
                {result?.prediction === "Osteoporosis" && (
                  <div
                    className={`rounded-xl p-4 ${dark ? "bg-slate-800/60" : "bg-slate-50"} border ${
                      dark ? "border-slate-700" : "border-slate-200"
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider mb-2 ${mutedText}`}
                    >
                      Recommendation
                    </p>
                    <p className="text-sm leading-relaxed">
                      We recommend consulting a qualified healthcare
                      professional for a comprehensive evaluation.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* <section className="w-full flex justify-center mt-6">
        {result?.prediction === "Osteoporosis" && (
          <div className="w-full max-w-5xl h-[520px] overflow-hidden rounded-2xl shadow-lg border">
            <DoctorMap />
          </div>
        )}
      </section> */}
      {result?.prediction === "Osteoporosis" && (
        <section
          className={`w-full max-w-5xl mx-auto h-[600px] mt-6 ${dark ? "bone-grid" : ""} rounded-2xl shadow-lg overflow-hidden`}
        >
          {result?.prediction === "Osteoporosis" && <DoctorMap />}
        </section>
      )}

      {/* FEATURES */}
      <section
        id="features"
        className={`py-16 ${dark ? "bg-slate-900/50" : "bg-slate-100/70"}`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-12">
            {t.features_title}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "⚡",
                title: t.feature1_title,
                desc: t.feature1_desc,
                color:
                  "from-yellow-500/20 to-orange-500/20 border-yellow-500/20",
              },
              {
                icon: "🎯",
                title: t.feature2_title,
                desc: t.feature2_desc,
                color:
                  "from-green-500/20 to-emerald-500/20 border-green-500/20",
              },
              {
                icon: "🔒",
                title: t.feature3_title,
                desc: t.feature3_desc,
                color: "from-blue-500/20 to-cyan-500/20 border-blue-500/20",
              },
              {
                icon: "🌐",
                title: t.feature4_title,
                desc: t.feature4_desc,
                color:
                  "from-violet-500/20 to-purple-500/20 border-violet-500/20",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`rounded-2xl border bg-gradient-to-br p-5 ${f.color} ${dark ? "" : "bg-white"} transition-all hover:scale-[1.02]`}
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className={`text-sm leading-relaxed ${mutedText}`}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}





















// import { useState, useRef, useCallback } from "react";
// import DoctorMap from "./DoctorMap";

// const translations = {
//   en: {
//     lang: "English",
//     nav_home: "Home",
//     nav_about: "About",
//     nav_contact: "Contact",
//     hero_tag: "AI-Powered Diagnosis",
//     hero_title: "Osteoporosis",
//     hero_title2: "Detection",
//     hero_subtitle:
//       "Upload your bone density scan or X-ray image and receive an instant AI-powered diagnosis report with detailed insights.",
//     upload_title: "Upload Scan Image",
//     upload_desc: "Drag & drop your X-ray or bone scan here",
//     upload_or: "or",
//     upload_btn: "Browse Files",
//     upload_formats: "Supported: JPG, PNG, DICOM, PDF — Max 25MB",
//     analyze_btn: "Analyze Scan",
//     analyzing: "Analyzing...",
//     result_title: "Diagnosis Report",
//     result_confidence: "Confidence Score",
//     result_risk: "Risk Level",
//     result_recommendation: "Recommendation",
//     features_title: "Why Choose OsteoAI?",
//     feature1_title: "Instant Results",
//     feature1_desc: "Get AI-powered analysis in under 30 seconds.",
//     feature2_title: "High Accuracy",
//     feature2_desc: "98.4% accuracy validated by medical professionals.",
//     feature3_title: "Secure & Private",
//     feature3_desc: "HIPAA compliant. Your data is never stored.",
//     feature4_title: "Multilingual",
//     feature4_desc: "Supports 4+ Indian languages for wider accessibility.",
//     footer: "© 2025 OsteoAI. For diagnostic support only. Consult a physician.",
//     drop_active: "Drop your file here!",
//     file_selected: "File selected",
//     no_file: "Please upload a scan image first.",
//     risk_low: "Low Risk",
//     risk_moderate: "Moderate Risk",
//     risk_high: "High Risk",
//     rec_low: "Maintain a calcium-rich diet and regular exercise. Annual check-up recommended.",
//     rec_moderate: "Consult your physician for a detailed bone density test (DEXA scan).",
//     rec_high: "Immediate consultation with an orthopedic specialist is strongly advised.",
//   },
//   hi: {
//     lang: "हिंदी",
//     nav_home: "होम",
//     nav_about: "परिचय",
//     nav_contact: "संपर्क",
//     hero_tag: "AI-संचालित निदान",
//     hero_title: "ऑस्टियोपोरोसिस",
//     hero_title2: "डिटेक्शन",
//     hero_subtitle: "अपनी हड्डी की स्कैन या एक्स-रे छवि अपलोड करें और तत्काल AI-संचालित निदान रिपोर्ट प्राप्त करें।",
//     upload_title: "स्कैन छवि अपलोड करें",
//     upload_desc: "अपना X-ray या बोन स्कैन यहाँ खींचें और छोड़ें",
//     upload_or: "या",
//     upload_btn: "फ़ाइल चुनें",
//     upload_formats: "समर्थित: JPG, PNG, DICOM, PDF — अधिकतम 25MB",
//     analyze_btn: "स्कैन विश्लेषण करें",
//     analyzing: "विश्लेषण हो रहा है...",
//     result_title: "निदान रिपोर्ट",
//     result_confidence: "विश्वास स्कोर",
//     result_risk: "जोखिम स्तर",
//     result_recommendation: "सिफारिश",
//     features_title: "OsteoAI क्यों चुनें?",
//     feature1_title: "तत्काल परिणाम",
//     feature1_desc: "30 सेकंड में AI विश्लेषण प्राप्त करें।",
//     feature2_title: "उच्च सटीकता",
//     feature2_desc: "98.4% सटीकता, चिकित्सकों द्वारा सत्यापित।",
//     feature3_title: "सुरक्षित और निजी",
//     feature3_desc: "HIPAA अनुपालित। आपका डेटा कभी संग्रहीत नहीं।",
//     feature4_title: "बहुभाषी",
//     feature4_desc: "व्यापक पहुँच के लिए 4+ भारतीय भाषाएँ।",
//     footer: "© 2025 OsteoAI। केवल नैदानिक सहायता के लिए। डॉक्टर से परामर्श करें।",
//     drop_active: "यहाँ फ़ाइल छोड़ें!",
//     file_selected: "फ़ाइल चुनी गई",
//     no_file: "कृपया पहले स्कैन छवि अपलोड करें।",
//     risk_low: "कम जोखिम",
//     risk_moderate: "मध्यम जोखिम",
//     risk_high: "उच्च जोखिम",
//     rec_low: "कैल्शियम युक्त आहार और नियमित व्यायाम जारी रखें।",
//     rec_moderate: "विस्तृत हड्डी घनत्व परीक्षण के लिए अपने डॉक्टर से मिलें।",
//     rec_high: "तुरंत हड्डी विशेषज्ञ से परामर्श लें।",
//   },
//   mr: {
//     lang: "मराठी",
//     nav_home: "मुखपृष्ठ",
//     nav_about: "परिचय",
//     nav_contact: "संपर्क",
//     hero_tag: "AI-चालित निदान",
//     hero_title: "ऑस्टिओपोरोसिस",
//     hero_title2: "शोध",
//     hero_subtitle: "तुमची हाडांची स्कॅन किंवा एक्स-रे प्रतिमा अपलोड करा आणि तत्काळ AI-चालित निदान अहवाल मिळवा।",
//     upload_title: "स्कॅन प्रतिमा अपलोड करा",
//     upload_desc: "तुमचा X-ray किंवा बोन स्कॅन येथे ड्रॅग करा",
//     upload_or: "किंवा",
//     upload_btn: "फाइल निवडा",
//     upload_formats: "समर्थित: JPG, PNG, DICOM, PDF — कमाल 25MB",
//     analyze_btn: "स्कॅन विश्लेषण करा",
//     analyzing: "विश्लेषण होत आहे...",
//     result_title: "निदान अहवाल",
//     result_confidence: "विश्वास स्कोर",
//     result_risk: "जोखीम पातळी",
//     result_recommendation: "शिफारस",
//     features_title: "OsteoAI का निवडावे?",
//     feature1_title: "तत्काळ निकाल",
//     feature1_desc: "30 सेकंदात AI विश्लेषण मिळवा।",
//     feature2_title: "उच्च अचूकता",
//     feature2_desc: "98.4% अचूकता, वैद्यकीय तज्ञांनी प्रमाणित।",
//     feature3_title: "सुरक्षित आणि खाजगी",
//     feature3_desc: "HIPAA अनुपालित। तुमचा डेटा कधीही साठवला जात नाही।",
//     feature4_title: "बहुभाषिक",
//     feature4_desc: "व्यापक प्रवेशासाठी 4+ भारतीय भाषा।",
//     footer: "© 2025 OsteoAI। केवळ निदान सहाय्यासाठी। डॉक्टरांचा सल्ला घ्या।",
//     drop_active: "येथे फाइल सोडा!",
//     file_selected: "फाइल निवडली",
//     no_file: "कृपया आधी स्कॅन प्रतिमा अपलोड करा।",
//     risk_low: "कमी जोखीम",
//     risk_moderate: "मध्यम जोखीम",
//     risk_high: "उच्च जोखीम",
//     rec_low: "कॅल्शियमयुक्त आहार आणि नियमित व्यायाम सुरू ठेवा।",
//     rec_moderate: "तपशीलवार हाड घनता चाचणीसाठी डॉक्टरांना भेटा।",
//     rec_high: "हाड तज्ञाशी त्वरित सल्लामसलत करा।",
//   },
//   kn: {
//     lang: "ಕನ್ನಡ",
//     nav_home: "ಮುಖಪುಟ",
//     nav_about: "ಪರಿಚಯ",
//     nav_contact: "ಸಂಪರ್ಕ",
//     hero_tag: "AI-ಚಾಲಿತ ರೋಗನಿರ್ಣಯ",
//     hero_title: "ಆಸ್ಟಿಯೊಪೊರೊಸಿಸ್",
//     hero_title2: "ಪತ್ತೆ",
//     hero_subtitle: "ನಿಮ್ಮ ಮೂಳೆ ಸ್ಕ್ಯಾನ್ ಅಥವಾ X-ರೇ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ತಕ್ಷಣದ AI ರೋಗನಿರ್ಣಯ ವರದಿ ಪಡೆಯಿರಿ.",
//     upload_title: "ಸ್ಕ್ಯಾನ್ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
//     upload_desc: "ನಿಮ್ಮ X-ರೇ ಅಥವಾ ಮೂಳೆ ಸ್ಕ್ಯಾನ್ ಇಲ್ಲಿ ಎಳೆದು ಬಿಡಿ",
//     upload_or: "ಅಥವಾ",
//     upload_btn: "ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಿ",
//     upload_formats: "ಬೆಂಬಲಿತ: JPG, PNG, DICOM, PDF — ಗರಿಷ್ಠ 25MB",
//     analyze_btn: "ಸ್ಕ್ಯಾನ್ ವಿಶ್ಲೇಷಿಸಿ",
//     analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
//     result_title: "ರೋಗನಿರ್ಣಯ ವರದಿ",
//     result_confidence: "ವಿಶ್ವಾಸ ಸ್ಕೋರ್",
//     result_risk: "ಅಪಾಯದ ಮಟ್ಟ",
//     result_recommendation: "ಶಿಫಾರಸು",
//     features_title: "OsteoAI ಅನ್ನು ಏಕೆ ಆರಿಸಬೇಕು?",
//     feature1_title: "ತಕ್ಷಣದ ಫಲಿತಾಂಶ",
//     feature1_desc: "30 ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ AI ವಿಶ್ಲೇಷಣೆ ಪಡೆಯಿರಿ.",
//     feature2_title: "ಹೆಚ್ಚಿನ ನಿಖರತೆ",
//     feature2_desc: "98.4% ನಿಖರತೆ, ವೈದ್ಯರಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.",
//     feature3_title: "ಸುರಕ್ಷಿತ & ಖಾಸಗಿ",
//     feature3_desc: "HIPAA ಅನುಸರಣೆ. ನಿಮ್ಮ ಡೇಟಾ ಎಂದಿಗೂ ಸಂಗ್ರಹಿಸಲ್ಪಡುವುದಿಲ್ಲ.",
//     feature4_title: "ಬಹುಭಾಷಿಕ",
//     feature4_desc: "ವ್ಯಾಪಕ ಪ್ರವೇಶಕ್ಕಾಗಿ 4+ ಭಾರತೀಯ ಭಾಷೆಗಳು.",
//     footer: "© 2025 OsteoAI. ರೋಗನಿರ್ಣಯ ಸಹಾಯಕ್ಕಾಗಿ ಮಾತ್ರ. ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
//     drop_active: "ಇಲ್ಲಿ ಫೈಲ್ ಬಿಡಿ!",
//     file_selected: "ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ",
//     no_file: "ದಯವಿಟ್ಟು ಮೊದಲು ಸ್ಕ್ಯಾನ್ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
//     risk_low: "ಕಡಿಮೆ ಅಪಾಯ",
//     risk_moderate: "ಮಧ್ಯಮ ಅಪಾಯ",
//     risk_high: "ಹೆಚ್ಚಿನ ಅಪಾಯ",
//     rec_low: "ಕ್ಯಾಲ್ಸಿಯಂ ಸಮೃದ್ಧ ಆಹಾರ ಮತ್ತು ನಿಯಮಿತ ವ್ಯಾಯಾಮ ಮುಂದುವರಿಸಿ.",
//     rec_moderate: "ವಿವರವಾದ ಮೂಳೆ ಸಾಂದ್ರತೆ ಪರೀಕ್ಷೆಗಾಗಿ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ.",
//     rec_high: "ಅಸ್ಥಿ ತಜ್ಞರನ್ನು ತಕ್ಷಣ ಸಂಪರ್ಕಿಸಿ.",
//   },
// };

// // ── Radiology Report Component ──────────────────────────────────────────────
// function RadiologyReport({ report, dark }) {
//   const [open, setOpen] = useState(true);
//   const mutedText = dark ? "text-slate-400" : "text-slate-500";
//   const cardBg = dark ? "bg-[#111827] border-slate-700/50" : "bg-white border-slate-200";
//   const rowBg = dark ? "bg-slate-800/40" : "bg-slate-50";

//   const confidenceBadge = {
//     high: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
//     moderate: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
//     low: "bg-red-500/15 text-red-400 border-red-500/30",
//   }[report.confidence] || "bg-slate-500/15 text-slate-400 border-slate-500/30";

//   const riskBadge = (val) => {
//     if (!val) return "";
//     const v = val.toLowerCase();
//     if (v.includes("high") || v.includes("compromised") || v.includes("rarefied"))
//       return "text-red-400";
//     if (v.includes("moderate") || v.includes("medium"))
//       return "text-yellow-400";
//     return "text-emerald-400";
//   };

//   return (
//     <div className={`rounded-2xl border ${cardBg} overflow-hidden mt-6 slide-in`}>
//       {/* Header */}
//       <div
//         className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
//         style={{ background: dark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.05)" }}
//         onClick={() => setOpen(!open)}
//       >
//         <div className="flex items-center gap-3">
//           <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//           </span>
//           <div>
//             <p className="font-bold text-sm tracking-wide">Radiology Report</p>
//             <p className={`text-xs ${mutedText}`}>{report.technique}</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-3">
//           <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${confidenceBadge}`}>
//             {report.confidence} confidence
//           </span>
//           <svg
//             className={`w-4 h-4 ${mutedText} transition-transform duration-300 ${open ? "rotate-180" : ""}`}
//             fill="none" stroke="currentColor" viewBox="0 0 24 24"
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//           </svg>
//         </div>
//       </div>

//       {open && (
//         <div className="px-6 pb-6 pt-2 space-y-5">
//           {/* Clinical Indication */}
//           <div className={`rounded-xl p-4 ${rowBg} border ${dark ? "border-slate-700/50" : "border-slate-200"}`}>
//             <p className={`text-xs font-semibold uppercase tracking-widest mb-1.5 ${mutedText}`}>Clinical Indication</p>
//             <p className="text-sm leading-relaxed">{report.clinical_indication}</p>
//           </div>

//           {/* Findings Grid */}
//           <div>
//             <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${mutedText}`}>Findings</p>
//             <div className="grid sm:grid-cols-2 gap-3">
//               {[
//                 { label: "Bone Density", value: report.findings.bone_density },
//                 { label: "Cortical Integrity", value: report.findings.cortical_integrity },
//                 { label: "Trabecular Pattern", value: report.findings.trabecular_pattern },
//                 { label: "Micro-Fracture Risk", value: report.findings.micro_fracture_risk },
//                 { label: "Notable Regions", value: report.findings.notable_regions, full: true },
//                 { label: "Artifacts", value: report.findings.artifacts, full: true },
//               ].map((item, i) => (
//                 <div
//                   key={i}
//                   className={`${item.full ? "sm:col-span-2" : ""} rounded-xl p-3.5 border ${dark ? "bg-slate-800/50 border-slate-700/40" : "bg-white border-slate-200"}`}
//                 >
//                   <p className={`text-xs font-semibold mb-1 ${mutedText}`}>{item.label}</p>
//                   <p className={`text-sm capitalize font-medium ${riskBadge(item.value)}`}>{item.value}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Impression */}
//           <div className={`rounded-xl p-4 border-l-4 ${dark ? "bg-red-500/5 border-red-500/50" : "bg-red-50 border-red-400"}`}>
//             <p className={`text-xs font-semibold uppercase tracking-widest mb-1.5 text-red-400`}>Impression</p>
//             <p className={`text-sm leading-relaxed ${dark ? "text-slate-200" : "text-slate-700"}`}>{report.impression}</p>
//           </div>

//           {/* Recommendation */}
//           <div className={`rounded-xl p-4 border-l-4 ${dark ? "bg-blue-500/5 border-blue-500/50" : "bg-blue-50 border-blue-400"}`}>
//             <p className={`text-xs font-semibold uppercase tracking-widest mb-1.5 text-blue-400`}>Recommendation</p>
//             <p className={`text-sm leading-relaxed ${dark ? "text-slate-200" : "text-slate-700"}`}>{report.recommendation}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Saliency Map + Original Image Comparison ────────────────────────────────
// function ImageComparison({ originalB64, saliencyB64, dark }) {
//   const [activeTab, setActiveTab] = useState("saliency");
//   const mutedText = dark ? "text-slate-400" : "text-slate-500";
//   const cardBg = dark ? "bg-[#111827] border-slate-700/50" : "bg-white border-slate-200";

//   return (
//     <div className={`rounded-2xl border ${cardBg} overflow-hidden mt-6 slide-in`}>
//       <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: dark ? "rgba(100,116,139,0.25)" : "#e2e8f0" }}>
//         <div className="flex items-center gap-2">
//           <span className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//             </svg>
//           </span>
//           <div>
//             <p className="font-bold text-sm">AI Visual Explanation</p>
//             <p className={`text-xs ${mutedText}`}>Gradient-weighted Class Activation Mapping</p>
//           </div>
//         </div>
//         {/* Tabs */}
//         <div className={`flex rounded-lg overflow-hidden border text-xs font-semibold ${dark ? "border-slate-700" : "border-slate-200"}`}>
//           {[
//             { id: "saliency", label: "Saliency Map" },
//             { id: "original", label: "Original" },
//           ].map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-3 py-1.5 transition-colors ${
//                 activeTab === tab.id
//                   ? "bg-violet-600 text-white"
//                   : dark
//                   ? "bg-transparent text-slate-400 hover:bg-slate-700"
//                   : "bg-transparent text-slate-500 hover:bg-slate-100"
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="p-4">
//         <div className="relative rounded-xl overflow-hidden flex items-center justify-center" style={{ minHeight: 280, background: dark ? "#0a0e1a" : "#f1f5f9" }}>
//           {activeTab === "saliency" ? (
//             <>
//               <img
//                 src={`data:image/png;base64,${saliencyB64}`}
//                 alt="Saliency Map"
//                 className="max-h-72 object-contain rounded-lg"
//               />
//               {/* Legend */}
//               <div className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
//                 style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", color: "#fff" }}>
//                 <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "linear-gradient(90deg,#0000ff,#00ff00,#ffff00,#ff0000)" }} />
//                 Low → High activation
//               </div>
//             </>
//           ) : (
//             <img
//               src={`data:image/png;base64,${originalB64}`}
//               alt="Original Scan"
//               className="max-h-72 object-contain rounded-lg"
//             />
//           )}
//         </div>
//         <p className={`text-xs mt-3 text-center ${mutedText}`}>
//           {activeTab === "saliency"
//             ? "Highlighted regions indicate areas the AI focused on when making its prediction. Red/yellow areas have the highest influence."
//             : "Original uploaded scan image as processed by the AI model."}
//         </p>
//       </div>
//     </div>
//   );
// }

// // ── Model Score Bars ─────────────────────────────────────────────────────────
// function ModelScores({ scores, dark }) {
//   const mutedText = dark ? "text-slate-400" : "text-slate-500";
//   return (
//     <div className="space-y-2 mt-4">
//       <p className={`text-xs font-semibold uppercase tracking-widest ${mutedText}`}>Ensemble Model Scores</p>
//       {scores.map((score, i) => (
//         <div key={i}>
//           <div className="flex justify-between items-center mb-1">
//             <span className={`text-xs ${mutedText}`}>Model {i + 1}</span>
//             <span className="text-xs font-bold" style={{ color: score > 0.8 ? "#f87171" : score > 0.5 ? "#fbbf24" : "#34d399" }}>
//               {(score * 100).toFixed(1)}%
//             </span>
//           </div>
//           <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
//             <div
//               className="h-full rounded-full bar-fill"
//               style={{
//                 width: `${score * 100}%`,
//                 background: score > 0.8
//                   ? "linear-gradient(90deg, #ef4444, #f87171)"
//                   : score > 0.5
//                   ? "linear-gradient(90deg, #d97706, #fbbf24)"
//                   : "linear-gradient(90deg, #059669, #34d399)",
//               }}
//             />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ── Main Page ────────────────────────────────────────────────────────────────
// export default function HomePage() {
//   const [dark, setDark] = useState(true);
//   const [lang, setLang] = useState("en");
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [dragging, setDragging] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState("");
//   const inputRef = useRef();
//   const resultRef = useRef();
//   const t = translations[lang];

//   const handleUpload = async () => {
//     if (!file) return alert("Please select a file");
//     const formData = new FormData();
//     formData.append("file", file);
//     setLoading(true);
//     setResult(null);
//     try {
//       const response = await fetch("http://127.0.0.1:8000/predict", {
//         method: "POST",
//         body: formData,
//       });
//       const data = await response.json();
//       setResult(data);
//       setLoading(false);
//       setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to connect to analysis server. Please try again.");
//       setLoading(false);
//     }
//   };

//   const handleFile = (f) => {
//     if (!f) return;
//     setFile(f);
//     setResult(null);
//     setError("");
//     if (f.type.startsWith("image/")) {
//       const url = URL.createObjectURL(f);
//       setPreview(url);
//     } else {
//       setPreview(null);
//     }
//   };

//   const onDrop = useCallback((e) => {
//     e.preventDefault();
//     setDragging(false);
//     const f = e.dataTransfer.files[0];
//     if (f) handleFile(f);
//   }, []);

//   const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
//   const onDragLeave = () => setDragging(false);

//   const bg = dark ? "bg-[#0a0e1a]" : "bg-slate-50";
//   const text = dark ? "text-slate-100" : "text-slate-800";
//   const cardBg = dark ? "bg-[#111827] border-slate-700/50" : "bg-white border-slate-200";
//   const mutedText = dark ? "text-slate-400" : "text-slate-500";
//   const navBg = dark ? "bg-[#0a0e1a]/80 border-slate-700/50" : "bg-white/80 border-slate-200";

//   const isOsteo = result?.prediction === "Osteoporosis";
//   const confidencePct = result ? Math.round(result.confidence * 100) : 0;

//   return (
//     <div
//       className={`min-h-screen w-full ${bg} ${text} font-sans transition-colors duration-300`}
//       style={{ fontFamily: "'Outfit', 'Noto Sans Devanagari', 'Noto Sans Kannada', sans-serif" }}
//     >
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
//         .gradient-text { background: linear-gradient(135deg, #60a5fa, #a78bfa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
//         .bone-grid { background-image: radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px); background-size: 28px 28px; }
//         .glow { box-shadow: 0 0 40px rgba(99,102,241,0.15), 0 0 80px rgba(99,102,241,0.05); }
//         .upload-glow:hover { box-shadow: 0 0 30px rgba(99,102,241,0.25); }
//         .pulse-ring { animation: pulseRing 2s ease-in-out infinite; }
//         @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.05);opacity:1} }
//         .slide-in { animation: slideIn 0.5s ease-out; }
//         @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
//         .spin { animation: spin 1s linear infinite; }
//         @keyframes spin { to{transform:rotate(360deg)} }
//         .bar-fill { animation: barFill 1.2s cubic-bezier(0.16,1,0.3,1) forwards; }
//         @keyframes barFill { from{width:0%} }
//         .scan-line { animation: scanLine 2s linear infinite; }
//         @keyframes scanLine { 0%{top:0%} 100%{top:100%} }
//       `}</style>

//       {/* NAV */}
//       <nav className={`fixed top-0 w-full z-50 border-b backdrop-blur-xl ${navBg} transition-colors duration-300`}>
//         <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">O</div>
//             <span className="font-bold text-lg tracking-tight">OsteoAI</span>
//           </div>
//           <div className="hidden md:flex items-center gap-6 text-sm font-medium">
//             <a href="#" className="hover:text-blue-400 transition-colors">{t.nav_home}</a>
//             <a href="#features" className="hover:text-blue-400 transition-colors">{t.nav_about}</a>
//             <a href="#" className="hover:text-blue-400 transition-colors">{t.nav_contact}</a>
//           </div>
//           <div className="flex items-center gap-3">
//             <select
//               value={lang}
//               onChange={(e) => setLang(e.target.value)}
//               className={`text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-colors ${dark ? "bg-slate-800 border-slate-600 text-slate-200" : "bg-white border-slate-300 text-slate-700"}`}
//             >
//               {Object.entries(translations).map(([k, v]) => (
//                 <option key={k} value={k}>{v.lang}</option>
//               ))}
//             </select>
//             <button
//               onClick={() => setDark(!dark)}
//               className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${dark ? "bg-slate-800 border-slate-600 text-yellow-400 hover:bg-slate-700" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"}`}
//             >
//               {dark ? (
//                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
//                 </svg>
//               ) : (
//                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* HERO */}
//       <section className={`relative w-full pt-32 pb-16 overflow-hidden ${dark ? "bone-grid" : ""}`}>
//         {dark && (
//           <>
//             <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
//             <div className="absolute top-40 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
//           </>
//         )}
//         <div className="w-full mx-auto px-4 text-center relative z-10">
//           <span className={`inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 border ${dark ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600"}`}>
//             {t.hero_tag}
//           </span>
//           <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-4">
//             <span className="gradient-text">{t.hero_title}</span>
//             <br />
//             <span>{t.hero_title2}</span>
//           </h1>
//           <p className={`max-w-2xl mx-auto text-lg mt-6 leading-relaxed ${mutedText}`}>{t.hero_subtitle}</p>
//         </div>
//       </section>

//       {/* UPLOAD + QUICK RESULT */}
//       <section className="max-w-6xl mx-auto px-4 pb-10">
//         <div className="grid md:grid-cols-2 gap-8">
//           {/* Upload Card */}
//           <div className={`rounded-2xl border p-6 ${cardBg} glow transition-all duration-300`}>
//             <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
//               <span className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
//                 <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
//                 </svg>
//               </span>
//               {t.upload_title}
//             </h2>

//             <div
//               onDrop={onDrop}
//               onDragOver={onDragOver}
//               onDragLeave={onDragLeave}
//               onClick={() => inputRef.current.click()}
//               className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer min-h-[200px] flex flex-col items-center justify-center gap-3 upload-glow
//                 ${dragging ? "border-blue-400 bg-blue-500/10 scale-[1.01]" : dark ? "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50" : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/50"}`}
//             >
//               <input ref={inputRef} type="file" className="hidden" accept="image/*,.pdf,.dcm" onChange={(e) => handleFile(e.target.files[0])} />
//               {preview ? (
//                 <div className="relative w-full h-48 flex items-center justify-center overflow-hidden rounded-lg">
//                   <img src={preview} alt="preview" className="h-full object-contain rounded-lg" />
//                   {/* scanning animation */}
//                   {loading && (
//                     <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
//                       <div className="scan-line absolute left-0 right-0 h-0.5 bg-blue-400/60" style={{ boxShadow: "0 0 8px 2px rgba(96,165,250,0.5)" }} />
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <>
//                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center pulse-ring ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
//                     <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                   </div>
//                   <p className={`font-medium text-sm ${mutedText}`}>{dragging ? t.drop_active : t.upload_desc}</p>
//                 </>
//               )}
//               {file && <p className="text-xs font-medium text-blue-400 mt-1">✓ {t.file_selected}: {file.name}</p>}
//             </div>

//             <p className={`text-xs mt-2 text-center ${mutedText}`}>{t.upload_or}</p>
//             <button
//               onClick={() => inputRef.current.click()}
//               className={`w-full mt-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${dark ? "border-slate-600 hover:bg-slate-700 text-slate-300" : "border-slate-300 hover:bg-slate-100 text-slate-600"}`}
//             >
//               {t.upload_btn}
//             </button>
//             <p className={`text-xs mt-2 text-center ${mutedText}`}>{t.upload_formats}</p>
//             {error && <p className="mt-3 text-red-400 text-sm text-center">{error}</p>}

//             <button
//               onClick={handleUpload}
//               disabled={loading}
//               className="w-full mt-5 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
//             >
//               {loading ? (
//                 <>
//                   <svg className="w-4 h-4 spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                   </svg>
//                   {t.analyzing}
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                   </svg>
//                   {t.analyze_btn}
//                 </>
//               )}
//             </button>
//           </div>


//           <div
//   className={`rounded-2xl border p-6 ${cardBg} transition-all duration-300`}
// >
//   {/* Header */}
//   <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
//     <span className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
//       <svg
//         className="w-4 h-4 text-emerald-400"
//         fill="none"
//         stroke="currentColor"
//         viewBox="0 0 24 24"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//         />
//       </svg>
//     </span>
//     {t.result_title}
//   </h2>

//   {/* EMPTY STATE */}
//   {!result && !loading && (
//     <div
//       className={`h-64 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed ${
//         dark ? "border-slate-700" : "border-slate-200"
//       }`}
//     >
//       <div
//         className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
//           dark ? "bg-slate-800" : "bg-slate-100"
//         }`}
//       >
//         <svg
//           className={`w-8 h-8 ${mutedText}`}
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={1.5}
//             d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//           />
//         </svg>
//       </div>
//       <p className={`text-sm ${mutedText}`}>
//         Results will appear here
//       </p>
//     </div>
//   )}

//   {/* LOADING STATE */}
//   {loading && (
//     <div className="h-64 flex flex-col items-center justify-center gap-4">
//       <div className="relative w-16 h-16">
//         <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
//         <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
//       </div>

//       <p className={`text-sm font-medium ${mutedText}`}>
//         {t.analyzing}
//       </p>

//       {/* Animated Progress */}
//       <div
//         className={`w-48 h-1.5 rounded-full overflow-hidden ${
//           dark ? "bg-slate-700" : "bg-slate-200"
//         }`}
//       >
//         <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 w-2/3 animate-pulse" />
//       </div>
//     </div>
//   )}

//   {/* RESULT */}
//   {result && (
//     <div className="space-y-4 animate-fadeIn">
//       {/* Prediction Card */}
//       <div
//         className={`rounded-xl border p-4 ${
//           result.prediction === "Osteoporosis"
//             ? dark
//               ? "bg-red-500/5 border-red-500/30"
//               : "bg-red-50 border-red-200"
//             : dark
//             ? "bg-emerald-500/5 border-emerald-500/30"
//             : "bg-emerald-50 border-emerald-200"
//         }`}
//       >
//         <div className="flex items-center justify-between">
//           <span className={`text-xs font-semibold uppercase ${mutedText}`}>
//             Prediction
//           </span>

//           <span
//             className={`text-sm font-extrabold px-3 py-1 rounded-full border ${
//               result.prediction === "Osteoporosis"
//                 ? "bg-red-500/15 text-red-400 border-red-500/30"
//                 : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
//             }`}
//           >
//             {result.prediction}
//           </span>
//         </div>

//         <p className={`text-xs mt-2 ${mutedText}`}>
//           {result.prediction === "Osteoporosis"
//             ? `⚠ ${result.message}`
//             : `✓ ${result.message}`}
//         </p>
//       </div>

//       {/* Confidence */}
//       <div>
//         <div className="flex justify-between items-center mb-1">
//           <span className={`text-xs ${mutedText}`}>
//             {t.result_confidence}
//           </span>
//           <span className="text-xs font-bold text-blue-400">
//             {confidencePct}%
//           </span>
//         </div>

//         <div
//           className={`h-2 rounded-full overflow-hidden ${
//             dark ? "bg-slate-700" : "bg-slate-200"
//           }`}
//         >
//           <div
//             className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
//             style={{ width: `${confidencePct}%` }}
//           />
//         </div>
//       </div>

//       {/* Doctor Map */}
//       {result?.prediction === "Osteoporosis" && (
//         <div className="w-full max-w-5xl h-[250px] overflow-hidden rounded-2xl shadow-lg border">
//           <DoctorMap />
//         </div>
//       )}
//     </div>
//   )}
// </div>

//           {/* Quick Result Card */}
//           {/* <div className={`rounded-2xl border p-6 ${cardBg} transition-all duration-300 ${result ? "slide-in" : ""}`}>
//             <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
//               <span className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
//                 <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </span>
//               {t.result_title}
//             </h2>

//             {!result && !loading && (
//               <div className={`h-64 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed ${dark ? "border-slate-700" : "border-slate-200"}`}>
//                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
//                   <svg className={`w-8 h-8 ${mutedText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                 </div>
//                 <p className={`text-sm ${mutedText}`}>Results will appear here</p>
//               </div>
//             )}

//             {loading && (
//               <div className="h-64 flex flex-col items-center justify-center gap-4">
//                 <div className="relative w-16 h-16">
//                   <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
//                   <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 spin" />
//                 </div>
//                 <p className={`text-sm font-medium ${mutedText}`}>{t.analyzing}</p>
//                 <div className={`w-48 h-1.5 rounded-full overflow-hidden ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
//                   <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full bar-fill" style={{ width: "70%" }} />
//                 </div>
//               </div>
//             )}

//             {result && (
//               <div className="space-y-4 slide-in">
              
//                 <div className={`rounded-xl border p-4 ${isOsteo ? dark ? "bg-red-500/5 border-red-500/30" : "bg-red-50 border-red-200" : dark ? "bg-emerald-500/5 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"}`}>
//                   <div className="flex items-center justify-between">
//                     <span className={`text-xs font-semibold uppercase tracking-wider ${mutedText}`}>Prediction</span>
//                     <span className={`text-sm font-extrabold px-3 py-1 rounded-full border ${isOsteo ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"}`}>
//                       {result.prediction}
//                     </span>
//                   </div>
//                   <p className={`text-xs mt-2 ${mutedText}`}>
//                     {isOsteo ? `⚠ ${result.message}` : `✓ ${result.message}`}
//                   </p>
//                 </div>

            
                
//                 <div>
//                   <div className="flex justify-between items-center mb-1">
//                     <span className={`text-xs ${mutedText}`}>{t.result_confidence}</span>
//                     <span className="text-xs font-bold text-blue-400">{confidencePct}%</span>
//                   </div>
//                   <div className={`h-2 rounded-full overflow-hidden ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
//                     <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 bar-fill" style={{ width: `${confidencePct}%` }} />
//                   </div>
//                 </div>

          
//                 {result?.prediction === "Osteoporosis" && (
//           <div className="w-full max-w-5xl overflow-hidden rounded-2xl shadow-lg border">
//             <DoctorMap />
//           </div>
//         )}
//               </div>
//             )}
//           </div> */}
//         </div>
//       </section>

//       {/* DETAILED REPORT SECTION — shown only after result */}
//       {result && (
//         <section ref={resultRef} className="max-w-6xl mx-auto px-4 pb-16 slide-in">
//           {/* Divider */}
//           <div className="flex items-center gap-4 mb-6">
//             <div className={`flex-1 h-px ${dark ? "bg-slate-700" : "bg-slate-200"}`} />
//             <span className={`text-xs font-semibold uppercase tracking-widest px-3 ${mutedText}`}>Detailed Analysis</span>
//             <div className={`flex-1 h-px ${dark ? "bg-slate-700" : "bg-slate-200"}`} />
//           </div>

//           <div className="grid md:grid-cols-2 gap-8">
//             {/* Left: Saliency map */}
//             <div>
//               {result.saliency_map_b64 && result.original_image_b64 && (
//                 <ImageComparison
//                   originalB64={result.original_image_b64}
//                   saliencyB64={result.saliency_map_b64}
//                   dark={dark}
//                 />
//               )}
//             </div>

//             {/* Right: Radiology report */}
//             <div>
//               {result.radiology_report && (
//                 <RadiologyReport report={result.radiology_report} dark={dark} />
//               )}
//             </div>
//           </div>

//           {/* Full-width recommendation for osteoporosis */}
//           {isOsteo && result.radiology_report && (
//             <div className={`mt-6 rounded-2xl border p-6 slide-in ${dark ? "bg-amber-500/5 border-amber-500/25" : "bg-amber-50 border-amber-200"}`}>
//               <div className="flex items-start gap-4">
//                 <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
//                   <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="font-bold text-amber-400 mb-1">Clinical Advisory</p>
//                   <p className={`text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700"}`}>
//                     {result.radiology_report.recommendation}
//                   </p>
//                   <p className={`text-xs mt-2 ${mutedText}`}>
//                     This report is AI-generated for diagnostic support only. Always consult a licensed radiologist or physician before making clinical decisions.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </section>
//       )}

//       {/* FEATURES */}
//       <section id="features" className={`py-16 ${dark ? "bg-slate-900/50" : "bg-slate-100/70"}`}>
//         <div className="max-w-6xl mx-auto px-4">
//           <h2 className="text-3xl font-extrabold text-center mb-12">{t.features_title}</h2>
//           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {[
//               { icon: "⚡", title: t.feature1_title, desc: t.feature1_desc, color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/20" },
//               { icon: "🎯", title: t.feature2_title, desc: t.feature2_desc, color: "from-green-500/20 to-emerald-500/20 border-green-500/20" },
//               { icon: "🔒", title: t.feature3_title, desc: t.feature3_desc, color: "from-blue-500/20 to-cyan-500/20 border-blue-500/20" },
//               { icon: "🌐", title: t.feature4_title, desc: t.feature4_desc, color: "from-violet-500/20 to-purple-500/20 border-violet-500/20" },
//             ].map((f, i) => (
//               <div key={i} className={`rounded-2xl border bg-gradient-to-br p-5 ${f.color} transition-all hover:scale-[1.02]`}>
//                 <div className="text-3xl mb-3">{f.icon}</div>
//                 <h3 className="font-bold mb-1">{f.title}</h3>
//                 <p className={`text-sm leading-relaxed ${mutedText}`}>{f.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer className={`text-center py-6 text-xs ${mutedText} border-t ${dark ? "border-slate-800" : "border-slate-200"}`}>
//         {t.footer}
//       </footer>
//     </div>
//   );
// }








































