import React, { useState, useId } from 'react';
import { X, Plus, Clipboard, Check, AlertCircle, Link, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { WireguardServer } from '../types';
import { parseWireguardUri, parseWireguardConf, USER_DEFAULT_URI } from '../utils/wireguard';

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddServer: (server: WireguardServer, activateImmediately: boolean) => void;
}

export const AddServerModal: React.FC<AddServerModalProps> = ({
  isOpen,
  onClose,
  onAddServer,
}) => {
  const [tab, setTab] = useState<'uri' | 'conf'>('uri');
  const [uriInput, setUriInput] = useState<string>('');
  const [confInput, setConfInput] = useState<string>('');
  const [serverName, setServerName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<WireguardServer | null>(null);
  const [copiedSample, setCopiedSample] = useState(false);

  const uriInputId = useId();
  const serverNameId = useId();
  const confInputId = useId();

  if (!isOpen) return null;

  const handleUriChange = (val: string) => {
    setUriInput(val);
    setError(null);
    if (!val.trim()) {
      setParsedPreview(null);
      return;
    }
    try {
      const parsed = parseWireguardUri(val);
      setParsedPreview(parsed);
      if (!serverName && parsed.name) {
        setServerName(parsed.name);
      }
    } catch (e: any) {
      setParsedPreview(null);
      setError(e.message || 'صيغة الرابط غير صحيحة');
    }
  };

  const handleConfChange = (val: string) => {
    setConfInput(val);
    setError(null);
    if (!val.trim()) {
      setParsedPreview(null);
      return;
    }
    try {
      const parsed = parseWireguardConf(val, serverName || 'WireGuard Config');
      setParsedPreview(parsed);
    } catch (e: any) {
      setParsedPreview(null);
      setError('تعذر قراءة ملف الإعدادات');
    }
  };

  const handleLoadUserSample = () => {
    setTab('uri');
    handleUriChange(USER_DEFAULT_URI);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (text.toLowerCase().includes('wireguard://')) {
          setTab('uri');
          handleUriChange(text);
        } else if (text.includes('[Interface]') || text.includes('[Peer]')) {
          setTab('conf');
          handleConfChange(text);
        } else {
          setUriInput(text);
          handleUriChange(text);
        }
      }
    } catch {
      setError('يرجى لصق الرابط يدويًا في المربع أدناه');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setTab('conf');
        const customName = file.name.replace(/\.conf$/i, '');
        setServerName(customName);
        try {
          const parsed = parseWireguardConf(content, customName);
          setConfInput(content);
          setParsedPreview(parsed);
        } catch {
          setError('تعذر قراءة ملف .conf');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (activateImmediately: boolean) => {
    if (!parsedPreview) {
      setError('يرجى إدخال رابط WireGuard صالح أولاً');
      return;
    }

    const finalServer: WireguardServer = {
      ...parsedPreview,
      id: 'wg-custom-' + Date.now().toString(36),
      name: serverName.trim() || parsedPreview.name || 'سيرفر مخصص',
      isCustom: true,
      createdAt: Date.now(),
    };

    onAddServer(finalServer, activateImmediately);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-server-title"
        className="relative w-full max-w-lg bg-[#080d24] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] max-h-[90vh] flex flex-col text-right overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <h2 id="add-server-title" className="text-lg font-bold text-white tracking-wide">
              إضافة خادم WireGuard
            </h2>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Plus className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 my-3.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setTab('uri')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              tab === 'uri'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>رابط URI (wireguard://)</span>
          </button>

          <button
            onClick={() => setTab('conf')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              tab === 'conf'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ملف أو نص .conf</span>
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 pl-0.5">
          {/* Quick paste helper button */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <button
              onClick={handlePasteClipboard}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
              <span>لصق من الحافظة</span>
            </button>

            <button
              onClick={handleLoadUserSample}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900/90 border border-blue-500/50 text-xs font-semibold text-blue-300 flex items-center gap-1.5 transition-colors"
            >
              {copiedSample ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">تم إدراج رابط بلي بنجاح</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>إدراج رابط بلي (SELOOM1-WARP BALLY)</span>
                </>
              )}
            </button>
          </div>

          {/* URI Input Mode */}
          {tab === 'uri' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-blue-400/90 font-mono">يدعم بروتوكول wireguard:// المباشر</span>
                <label htmlFor={uriInputId} className="block text-xs font-bold text-slate-300">
                  الصق رابط الخادم (wireguard://...) :
                </label>
              </div>
              <textarea
                id={uriInputId}
                value={uriInput}
                onChange={(e) => handleUriChange(e.target.value)}
                placeholder="wireguard://98qlf4cSnq2VMmonjeWZI1dS1994IzfbR%2FfRdG%2FiCoE%3D@engage.cloudflareclient.com:2408?address=172.16.0.2%2F32%2C2606%3A4700%3A110%3A8d70%3A8df1%3A6e3d%3A693b%3Aea40%2F128&publickey=bmXOC%2BF1FxEMF9dyiK2H5%2F1SUtzH0JuVo51h2wPfgyo%3D&privatekey=98qlf4cSnq2VMmonjeWZI1dS1994IzfbR%2FfRdG%2FiCoE%3D#SELOOM1-WARP%20BALLY%20"
                dir="ltr"
                rows={4}
                className="w-full bg-[#050816] border border-blue-500/40 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-xl p-3 text-xs font-mono text-cyan-300 placeholder:text-slate-600 outline-none resize-none break-all"
              />
            </div>
          ) : (
            /* Conf Text/File Mode */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="cursor-pointer text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                  <span>رفع ملف .conf</span>
                  <input
                    type="file"
                    accept=".conf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <label htmlFor={confInputId} className="block text-xs font-bold text-slate-300">
                  أو الصق محتوى ملف WireGuard (.conf) :
                </label>
              </div>
              <textarea
                id={confInputId}
                value={confInput}
                onChange={(e) => handleConfChange(e.target.value)}
                placeholder="[Interface]&#10;PrivateKey = ...&#10;Address = 172.16.0.2/32&#10;&#10;[Peer]&#10;PublicKey = ...&#10;Endpoint = engage.cloudflareclient.com:2408"
                dir="ltr"
                rows={4}
                className="w-full bg-[#050816] border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl p-3 text-xs font-mono text-emerald-300 placeholder:text-slate-600 outline-none resize-none"
              />
            </div>
          )}

          {/* Server Name input */}
          <div className="space-y-1">
            <label htmlFor={serverNameId} className="block text-xs font-bold text-slate-300">
              اسم الخادم (اختياري) :
            </label>
            <input
              id={serverNameId}
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="مثال: WARP BALLY / Cloudflare Fast"
              className="w-full bg-[#050816] border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Real-time Parsed Preview Box */}
          {parsedPreview && (
            <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم التعرف على الإعدادات بنجاح</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  {parsedPreview.protocol}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Endpoint:</span>
                  <span className="text-cyan-300 truncate block">{parsedPreview.endpoint}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Addresses:</span>
                  <span className="text-emerald-300 truncate block">{parsedPreview.addresses.join(', ')}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Public Key:</span>
                  <span className="text-slate-300 truncate block">{parsedPreview.publicKey.substring(0, 16)}...</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">DNS & MTU:</span>
                  <span className="text-slate-300 truncate block">{parsedPreview.dns[0] || '1.1.1.1'} (MTU {parsedPreview.mtu})</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            إلغاء
          </button>

          <button
            onClick={() => handleSubmit(false)}
            disabled={!parsedPreview}
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition-colors"
          >
            حفظ في القائمة
          </button>

          <button
            onClick={() => handleSubmit(true)}
            disabled={!parsedPreview}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
          >
            إضافة وتنشيط الآن
          </button>
        </div>
      </div>
    </div>
  );
};
