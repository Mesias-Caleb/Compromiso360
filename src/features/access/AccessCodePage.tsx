import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { InstitutionalLogo } from '../../components/shared/InstitutionalLogo';
import { useAccessStore } from './access.store';
import { CAMPUSES } from '../../config/campuses';
import { OFFICIAL_EVENT_CONFIG } from '../../config/event';
import { getCommitmentUrl, isQrConfigured } from '../../config/qr';

export const AccessCodePage: React.FC = () => {
  const navigate = useNavigate();
  const { setCampusManually, verifyCode } = useAccessStore();
  const [commitmentUrl, setCommitmentUrl] = useState<string | null>(null);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    const url = getCommitmentUrl();
    setCommitmentUrl(url);
    setQrReady(isQrConfigured());
  }, []);

  const handleSelectCampus = (campusId: 'LIM' | 'JUL' | 'TPP') => {
    const campus = CAMPUSES[campusId];
    if (campus && campus.validAccessCodes[0]) {
      verifyCode(campus.validAccessCodes[0]);
    } else {
      setCampusManually(campusId);
    }
    navigate('/compromiso');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-brand-light">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* Left Column: editorial intro */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-primary" />
              <span>Consola del Evento · Administración</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-deep tracking-tight leading-tight">
              Yo me comprometo con el PEI {OFFICIAL_EVENT_CONFIG.peiPeriod}
            </h1>

            <p className="text-sm sm:text-base font-bold text-brand-primary tracking-wide">
              {OFFICIAL_EVENT_CONFIG.motto}
            </p>

            <p className="text-sm sm:text-base text-brand-muted leading-relaxed max-w-lg mx-auto lg:mx-0">
              Proyecta el código QR en la pantalla de cada sede. Los trabajadores lo escanean
              con su teléfono y completan el compromiso en su dispositivo.
            </p>
          </div>
        </div>

        {/* Right Column: QR panel */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[360px] rounded-3xl bg-brand-deep p-6 sm:p-7 text-white shadow-2xl flex flex-col items-center text-center gap-4">
            <InstitutionalLogo variant="light" size="sm" />

            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white leading-tight">
                YO ME COMPROMETO CON EL PEI
              </h2>
              <p className="text-[11px] font-bold text-brand-gold mt-1 tracking-wider uppercase">
                {OFFICIAL_EVENT_CONFIG.motto}
              </p>
            </div>

            {/* QR area */}
            <div className="w-full bg-white rounded-2xl p-5 shadow-lg flex flex-col items-center justify-center border border-slate-100 gap-3">
              {qrReady && commitmentUrl ? (
                <div className="w-full flex items-center justify-center">
                  <QRCodeSVG
                    value={commitmentUrl}
                    size={240}
                    level="M"
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    includeMargin={true}
                    margin={4}
                    className="w-[85%] sm:w-[90%] max-w-[300px] mx-auto"
                  />
                </div>
              ) : (
                /* Pending configuration state */
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
                    <QrCode className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">QR en espera</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-[200px]">
                      Configura{' '}
                      <code className="bg-slate-100 px-1 rounded text-slate-600">
                        VITE_PUBLIC_COMMITMENT_URL
                      </code>{' '}
                      para generar el código QR real.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-200 font-medium">
              Escanea el código QR e ingresa el código de tu campus
            </p>

            {/* Quick campus access buttons (admin shortcut) */}
            <div className="grid grid-cols-3 gap-2 w-full">
              {(['LIM', 'JUL', 'TPP'] as const).map((id) => {
                const campus = CAMPUSES[id];
                const colorClass =
                  id === 'LIM'
                    ? 'bg-campus-lim'
                    : id === 'JUL'
                    ? 'bg-campus-jul'
                    : 'bg-campus-tpp';
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectCampus(id)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl ${colorClass} text-white hover:opacity-90 transition-transform active:scale-95 shadow`}
                  >
                    <span className="font-extrabold text-sm tracking-wide">{id}</span>
                    <span className="text-[10px] text-white/90">{campus.city}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
