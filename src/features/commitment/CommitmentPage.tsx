import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Handshake,
  Gift,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Combobox } from '../../components/ui/combobox';
import { InstitutionalLogo } from '../../components/shared/InstitutionalLogo';
import { UniversitySilhouette } from '../../components/shared/UniversitySilhouette';
import { useAccessStore } from '../access/access.store';
import { CAMPUSES } from '../../config/campuses';
import { UNIVERSITY_AREAS } from '../../config/areas';
import { OFFICIAL_EVENT_CONFIG } from '../../config/event';
import {
  validateCommitmentForm,
  FormValidationErrors,
} from '../../domain/services/validation.service';
import { commitmentRepository } from '../../infrastructure/demo/demo-service';
import {
  getActiveWorkerSession,
  saveActiveWorkerSession,
} from '../../infrastructure/storage/local-commitment.repository';
import { CampusId } from '../../domain/models/campus';
import { Commitment } from '../../domain/models/commitment';

export const CommitmentPage: React.FC = () => {
  const { currentCampusId, setCampusManually } = useAccessStore();

  // Exactly three worker steps:
  // 'campus'  → 1. Selección de campus
  // 'form'    → 2. Formulario de compromiso
  // 'thankyou'→ 3. Agradecimiento con tarjeta personalizada
  const [step, setStep] = useState<'campus' | 'form' | 'thankyou'>('campus');

  // Form State — campus pre-filled from selection
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    campus: (currentCampusId || 'LIM') as CampusId,
    areaId: '',
    aceptacion: true,
    permisoPublicacion: true,
  });

  const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredCommitment, setRegisteredCommitment] = useState<Commitment | null>(null);

  // Check for active (<= 1 day) local worker session on mount
  useEffect(() => {
    const existing = getActiveWorkerSession();
    if (existing) {
      setRegisteredCommitment(existing);
      if (existing.campus) {
        setCampusManually(existing.campus);
        setFormData((prev) => ({ ...prev, campus: existing.campus }));
      }
      setStep('thankyou');
    }
  }, []);

  // Sync campus in form when store campus changes (after code verification)
  useEffect(() => {
    if (currentCampusId) {
      setFormData((prev) => ({ ...prev, campus: currentCampusId }));
    }
  }, [currentCampusId]);

  const handleSelectCampus = (campusId: CampusId) => {
    setCampusManually(campusId);
    setFormData((prev) => ({ ...prev, campus: campusId }));
    setStep('form');
  };

  // Handle Step 2: Commitment Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCommitmentForm(formData);

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const submissionToken = `sub_${formData.nombres.trim()}_${formData.apellidos.trim()}_${Date.now()}`;
      const area = UNIVERSITY_AREAS.find((a) => a.id === formData.areaId);

      const registered = await commitmentRepository.register({
        nombres: formData.nombres.trim().toUpperCase().replace(/\s+/g, ' '),
        apellidos: formData.apellidos.trim().toUpperCase().replace(/\s+/g, ' '),
        campus: formData.campus,
        areaId: formData.areaId,
        areaNombre: area ? area.name : 'Área General',
        textoVersion: OFFICIAL_EVENT_CONFIG.officialStatementVersion,
        aceptacion: formData.aceptacion,
        permisoPublicacion: formData.permisoPublicacion,
        clientSubmissionToken: submissionToken,
        origenDemo: false,
      });

      // Save local 1-day session to prevent accidental resubmission and allow direct reopen
      saveActiveWorkerSession(registered);
      setRegisteredCommitment(registered);
      setStep('thankyou');
    } catch (err) {
      setFormErrors({
        general: err instanceof Error ? err.message : 'Error inesperado al guardar el registro.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute initials for personalized card avatar
  const getInitials = (nombres: string, apellidos: string) => {
    const f = nombres ? nombres.trim().charAt(0) : '';
    const l = apellidos ? apellidos.trim().charAt(0) : '';
    return `${f}${l}`.toUpperCase() || 'UN';
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Layout: real mobile-first page — no phone frame, no simulated browser chrome
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-[100dvh] w-full bg-brand-light flex flex-col"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Inner container: centred on desktop, full-width on mobile */}
      <div className="flex-1 flex flex-col w-full max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* ================================================================= */}
        {/* ETAPA 1: SELECCIÓN DE CAMPUS                                      */}
        {/* ================================================================= */}
        {step === 'campus' && (
          <div className="flex-1 flex flex-col justify-between gap-8">
            <div className="space-y-6 text-center">
              <div className="flex justify-center pt-2">
                <InstitutionalLogo variant="dark" size="lg" useSvg className="[&_img]:h-24 [&_img]:w-auto"/>
              </div>

              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-brand-deep leading-snug">
                  Lanzamiento del<br />{OFFICIAL_EVENT_CONFIG.name} {OFFICIAL_EVENT_CONFIG.peiPeriod}
                </h1>
              </div>

              <div className="pt-2 space-y-4">
                <div>
                  <p className="text-base sm:text-lg font-extrabold text-brand-text">
                    Selecciona tu campus
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectCampus('LIM')}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-brand-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-interactive transition-all active:scale-[0.99] min-h-[72px]"
                  >
                    <div className="w-10 h-10 rounded-full bg-campus-lim/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-campus-lim" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-extrabold text-brand-deep">Campus Lima</div>
                      <div className="text-xs text-brand-muted">LIM</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectCampus('JUL')}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-brand-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-interactive transition-all active:scale-[0.99] min-h-[72px]"
                  >
                    <div className="w-10 h-10 rounded-full bg-campus-jul/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-campus-jul" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-extrabold text-brand-deep">Campus Juliaca</div>
                      <div className="text-xs text-brand-muted">JUL</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectCampus('TPP')}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-brand-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-interactive transition-all active:scale-[0.99] min-h-[72px]"
                  >
                    <div className="w-10 h-10 rounded-full bg-campus-tpp/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-campus-tpp" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-extrabold text-brand-deep">Campus Tarapoto</div>
                      <div className="text-xs text-brand-muted">TPP</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <UniversitySilhouette variant="subtle" />
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ETAPA 2: FORMULARIO DE COMPROMISO                                 */}
        {/* ================================================================= */}
        {step === 'form' && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex justify-center">
              <InstitutionalLogo variant="dark" size="sm"/>
            </div>

            <div className="text-center">
              <h1 className="text-lg sm:text-xl font-extrabold text-brand-deep">
                Yo me comprometo con el PEI
              </h1>
              <p className="text-xs text-brand-muted mt-0.5 font-medium">
                {OFFICIAL_EVENT_CONFIG.peiPeriod}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Nombres y apellidos */}
              <div className="space-y-1">
                <label htmlFor="form-nombres" className="text-xs font-semibold text-brand-text">
                  Nombres y apellidos *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="form-nombres"
                    placeholder="Nombres"
                    autoComplete="given-name"
                    value={formData.nombres}
                    onChange={(e) =>
                      setFormData({ ...formData, nombres: e.target.value.toUpperCase().replace(/\s+/g, ' ') })
                    }
                    onBlur={(e) => setFormData({ ...formData, nombres: e.target.value.trim().toUpperCase() })}
                    error={Boolean(formErrors.nombres)}
                    className="h-11 text-base uppercase"
                  />
                  <Input
                    id="form-apellidos"
                    placeholder="Apellidos"
                    autoComplete="family-name"
                    value={formData.apellidos}
                    onChange={(e) =>
                      setFormData({ ...formData, apellidos: e.target.value.toUpperCase().replace(/\s+/g, ' ') })
                    }
                    onBlur={(e) => setFormData({ ...formData, apellidos: e.target.value.trim().toUpperCase() })}
                    error={Boolean(formErrors.apellidos)}
                    className="h-11 text-base uppercase"
                  />
                </div>
                {(formErrors.nombres || formErrors.apellidos) && (
                  <span className="text-[11px] text-rose-600 block">
                    {formErrors.nombres || formErrors.apellidos}
                  </span>
                )}
              </div>

              {/* Campus — from selection, not editable */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-text">Campus *</label>
                <div className="h-11 px-3 flex items-center rounded-md border border-slate-200 bg-slate-50 text-base font-semibold text-brand-deep">
                  {CAMPUSES[formData.campus]?.name || formData.campus} ({formData.campus})
                </div>
              </div>

              {/* Área o unidad */}
              <div className="space-y-1">
                <label htmlFor="form-area" className="text-xs font-semibold text-brand-text">
                  Área o unidad *
                </label>
                <Combobox
                  id="form-area"
                  options={UNIVERSITY_AREAS.map((a) => ({ value: a.id, label: a.name }))}
                  value={formData.areaId}
                  onChange={(value) => setFormData({ ...formData, areaId: value })}
                  placeholder="Buscar área o unidad..."
                  emptyMessage="Sin coincidencias en el catálogo"
                  error={Boolean(formErrors.areaId)}
                  className="text-slate-900 placeholder:text-slate-400"
                />
                {formErrors.areaId && (
                  <span className="text-[11px] text-rose-600 block">{formErrors.areaId}</span>
                )}
              </div>

              {/* Declaración institucional única */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5">
                <Handshake className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <p className="text-xs text-amber-950 leading-relaxed italic">
                  &ldquo;Me comprometo a contribuir, desde mis funciones, al cumplimiento de los
                  objetivos del Plan Estratégico Institucional {OFFICIAL_EVENT_CONFIG.peiPeriod}.&rdquo;
                </p>
              </div>

              {/* Checkboxes de aceptación y consentimiento */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none min-h-[44px]">
                  <input
                    id="form-aceptacion"
                    type="checkbox"
                    checked={formData.aceptacion}
                    onChange={(e) => setFormData({ ...formData, aceptacion: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-deep border-slate-300 focus:ring-brand-interactive cursor-pointer"
                  />
                  <span className="text-xs font-bold text-brand-deep">
                    Asumo este compromiso.
                  </span>
                </label>
                {formErrors.aceptacion && (
                  <span className="text-[11px] text-rose-600 block">{formErrors.aceptacion}</span>
                )}
              </div>

              {formErrors.general && (
                <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.general}</span>
                </p>
              )}

              <Button
                id="submit-commitment-btn"
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full text-base font-bold shadow-md min-h-[44px]"
              >
                {isSubmitting ? 'Registrando...' : 'Registrar mi compromiso'}
              </Button>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* ETAPA 3: PANTALLA FINAL — AGRADECIMIENTO Y TARJETA CON REGALO     */}
        {/* ================================================================= */}
        {step === 'thankyou' && registeredCommitment && (
          <div className="flex-1 flex flex-col justify-between gap-6 text-center">
            <div className="space-y-5">
              {/* 1. Check verde animado de confirmación */}
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mt-1 shadow-sm animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 stroke-[2.5]" />
              </div>

              {/* 2. Título */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-brand-deep">
                  ¡Gracias por comprometerte!
                </h1>

                {/* 3. Mensaje */}
                <p className="text-sm text-brand-muted leading-relaxed px-2">
                  Ya formas parte del futuro de nuestra universidad
                </p>
              </div>

              {/* 4. Tarjeta institucional personalizada */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/90 shadow-md text-center space-y-3 relative overflow-hidden">
                <div className="w-14 h-14 rounded-full bg-brand-deep text-white font-bold text-lg flex items-center justify-center mx-auto shadow-sm border-2 border-brand-gold/40">
                  {getInitials(registeredCommitment.nombres, registeredCommitment.apellidos)}
                </div>

                <div className="space-y-0.5">
                  <div className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                    {registeredCommitment.nombres} {registeredCommitment.apellidos}
                  </div>
                  <div className="text-sm font-semibold text-brand-primary">
                    {CAMPUSES[registeredCommitment.campus]?.name || registeredCommitment.campus}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {registeredCommitment.areaNombre}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex flex-col items-center gap-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-deep">
                    Plan Estratégico Institucional {OFFICIAL_EVENT_CONFIG.peiPeriod}
                  </span>
                  <span className="text-[11px] font-semibold text-brand-gold tracking-widest">
                    {OFFICIAL_EVENT_CONFIG.motto}
                  </span>
                </div>
              </div>

              {/* 5. Sección visual destacada del regalo */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100/70 border-2 border-amber-300 shadow-sm text-center space-y-2">
                <div className="w-11 h-11 rounded-full bg-amber-500/15 border border-amber-400/40 flex items-center justify-center mx-auto">
                  <Gift className="w-6 h-6 text-amber-700 stroke-[2.2]" />
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-amber-950">
                  ¡Un regalo te espera!
                </h2>
                <p className="text-sm text-amber-900 leading-relaxed font-medium px-2">
                  Guarda una captura de esta pantalla y preséntala al finalizar la ceremonia para
                  recibir tu regalo.
                </p>
              </div>
            </div>

            {/* University Silhouette watermark at the bottom */}
            <div className="pb-2">
              <UniversitySilhouette variant="subtle" />
              <p className="text-[10px] text-slate-400 mt-1">
                Participación registrada · {OFFICIAL_EVENT_CONFIG.eventName}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
