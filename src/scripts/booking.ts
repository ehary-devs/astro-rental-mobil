/**
 * Form pemesanan → pesan WhatsApp. Semua berjalan di browser, tidak ada data yang dikirim ke server.
 * Data dari build (nomor WA, nama usaha, harga) dibaca dari atribut data-* agar tidak perlu script inline (CSP).
 * Picker mobil, kalender, dan jam adalah komponen custom (bukan popup native) supaya tampilan konsisten di semua OS.
 */

const LAYANAN_BANDARA = 'Antar jemput bandara';
const LAYANAN_LEPAS_KUNCI = 'Lepas kunci';
const MAX_DURASI = 30;

const pad = (n: number) => String(n).padStart(2, '0');
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const rupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function parseISO(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

const fmtShort = (d: Date) => d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtLong = (d: Date) =>
  d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/* ------------------------------------------------------------------ */
/* Popover: satu panel terbuka pada satu waktu                         */
/* ------------------------------------------------------------------ */

type Picker = { field: HTMLElement; trigger: HTMLButtonElement; panel: HTMLElement; onOpen?: () => void };

function createPopovers(pickers: Picker[]) {
  let current: Picker | null = null;

  const close = (returnFocus = false) => {
    if (!current) return;
    const p = current;
    p.panel.hidden = true;
    p.trigger.setAttribute('aria-expanded', 'false');
    p.field.classList.remove('is-open');
    current = null;
    if (returnFocus) p.trigger.focus();
  };

  const open = (p: Picker) => {
    if (current === p) return;
    close();
    p.panel.hidden = false;
    p.trigger.setAttribute('aria-expanded', 'true');
    p.field.classList.add('is-open');
    current = p;
    p.onOpen?.();
  };

  for (const p of pickers) {
    p.trigger.addEventListener('click', () => (current === p ? close() : open(p)));
    p.panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      }
    });
    p.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        open(p);
      } else if (e.key === 'Escape') {
        close();
      }
    });
  }

  document.addEventListener('pointerdown', (e) => {
    if (current && !current.field.contains(e.target as Node)) close();
  });
  document.addEventListener('focusin', (e) => {
    if (current && !current.field.contains(e.target as Node)) close();
  });

  return { close };
}

/* ------------------------------------------------------------------ */
/* Listbox (mobil, jam)                                                */
/* ------------------------------------------------------------------ */

function setupListbox(
  field: HTMLElement,
  onPick: (opt: HTMLElement) => void,
  closePanel: (returnFocus: boolean) => void,
): { onOpen: () => void; select: (opt: HTMLElement) => void; selected: () => HTMLElement | null } {
  const listbox = field.querySelector<HTMLElement>('[data-listbox]')!;
  const options = Array.from(listbox.querySelectorAll<HTMLElement>('[role="option"]'));
  const hidden = field.querySelector<HTMLInputElement>('input[type="hidden"]')!;
  const display = field.querySelector<HTMLElement>('[data-display]')!;
  let active = -1;

  options.forEach((o, i) => (o.id ||= `${listbox.getAttribute('aria-labelledby')}-opt-${i}`));

  const setActive = (i: number) => {
    active = Math.max(0, Math.min(options.length - 1, i));
    options.forEach((o, j) => o.classList.toggle('is-active', j === active));
    const el = options[active];
    listbox.setAttribute('aria-activedescendant', el.id);
    el.scrollIntoView({ block: 'nearest' });
  };

  const selected = () => options.find((o) => o.getAttribute('aria-selected') === 'true') ?? null;

  const select = (opt: HTMLElement) => {
    options.forEach((o) => o.setAttribute('aria-selected', String(o === opt)));
    hidden.value = opt.dataset.value ?? '';
    display.textContent = opt.dataset.label ?? '';
    onPick(opt);
  };

  listbox.addEventListener('click', (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (!opt) return;
    select(opt);
    closePanel(true);
  });

  listbox.addEventListener('pointermove', (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (opt) {
      active = options.indexOf(opt);
      options.forEach((o) => o.classList.toggle('is-active', o === opt));
    }
  });

  // Grid jam: panah kiri/kanan pindah 1, atas/bawah pindah satu baris.
  const cols = () => (listbox.classList.contains('slot-grid') ? 4 : 1);

  listbox.addEventListener('keydown', (e) => {
    const step: Record<string, number> = {
      ArrowDown: cols(),
      ArrowUp: -cols(),
      ArrowRight: cols() > 1 ? 1 : 0,
      ArrowLeft: cols() > 1 ? -1 : 0,
    };
    if (e.key in step && step[e.key] !== 0) {
      e.preventDefault();
      setActive(active + step[e.key]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (options[active]) {
        select(options[active]);
        closePanel(true);
      }
    } else if (e.key === 'Tab') {
      closePanel(false);
    }
  });

  const onOpen = () => {
    const sel = selected();
    setActive(sel ? options.indexOf(sel) : 0);
    listbox.focus({ preventScroll: true });
  };

  return { onOpen, select, selected };
}

/* ------------------------------------------------------------------ */
/* Kalender                                                            */
/* ------------------------------------------------------------------ */

function setupCalendar(
  field: HTMLElement,
  min: Date,
  max: Date,
  initial: Date,
  onPick: (d: Date) => void,
  closePanel: (returnFocus: boolean) => void,
) {
  const hidden = field.querySelector<HTMLInputElement>('input[type="hidden"]')!;
  const display = field.querySelector<HTMLElement>('[data-display]')!;
  const title = field.querySelector<HTMLElement>('[data-cal-title]')!;
  const daysEl = field.querySelector<HTMLElement>('[data-cal-days]')!;
  const prev = field.querySelector<HTMLButtonElement>('[data-cal-prev]')!;
  const next = field.querySelector<HTMLButtonElement>('[data-cal-next]')!;
  const todayISO = toISO(startOfDay(new Date()));

  let selected = initial;
  let view = new Date(initial.getFullYear(), initial.getMonth(), 1);
  let focusDate = initial;

  const inRange = (d: Date) => d >= min && d <= max;

  const render = (focus = false) => {
    title.textContent = view.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    prev.disabled = view <= new Date(min.getFullYear(), min.getMonth(), 1);
    next.disabled = view >= new Date(max.getFullYear(), max.getMonth(), 1);

    const frag = document.createDocumentFragment();
    // Minggu dimulai Senin.
    const lead = (view.getDay() + 6) % 7;
    for (let i = 0; i < lead; i++) frag.appendChild(document.createElement('span'));

    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(view.getFullYear(), view.getMonth(), day);
      const iso = toISO(d);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day';
      btn.textContent = String(day);
      btn.dataset.date = iso;
      btn.setAttribute('aria-label', fmtLong(d));
      btn.setAttribute('aria-pressed', String(iso === toISO(selected)));
      btn.tabIndex = iso === toISO(focusDate) ? 0 : -1;
      if (d.getDay() === 0) btn.classList.add('is-sun');
      if (iso === todayISO) btn.classList.add('is-today');
      if (!inRange(d)) btn.disabled = true;
      frag.appendChild(btn);
    }
    daysEl.replaceChildren(frag);
    if (focus) daysEl.querySelector<HTMLButtonElement>(`[data-date="${toISO(focusDate)}"]`)?.focus();
  };

  const choose = (d: Date) => {
    if (!inRange(d)) return;
    selected = d;
    focusDate = d;
    hidden.value = toISO(d);
    display.textContent = fmtShort(d);
    onPick(d);
  };

  const moveFocus = (d: Date) => {
    if (d < min) d = min;
    if (d > max) d = max;
    focusDate = d;
    view = new Date(d.getFullYear(), d.getMonth(), 1);
    render(true);
  };

  daysEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.day');
    if (!btn || btn.disabled) return;
    choose(parseISO(btn.dataset.date!)!);
    closePanel(true);
  });

  daysEl.addEventListener('keydown', (e) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) {
      e.preventDefault();
      moveFocus(addDays(focusDate, map[e.key]));
    }
  });

  prev.addEventListener('click', () => {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    render();
  });
  next.addEventListener('click', () => {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    render();
  });

  field.querySelectorAll<HTMLButtonElement>('[data-cal-quick]').forEach((b) =>
    b.addEventListener('click', () => {
      const today = startOfDay(new Date());
      const q = b.dataset.calQuick;
      const d = q === 'sat' ? addDays(today, (6 - today.getDay() + 7) % 7) : addDays(today, Number(q));
      choose(d);
      closePanel(true);
    }),
  );

  choose(initial);

  return {
    onOpen: () => {
      focusDate = selected;
      view = new Date(selected.getFullYear(), selected.getMonth(), 1);
      render(true);
    },
    value: () => selected,
  };
}

/* ------------------------------------------------------------------ */
/* Form utama                                                          */
/* ------------------------------------------------------------------ */

export function initBookingForm(form: HTMLFormElement): void {
  const $ = <T extends Element>(sel: string) => form.querySelector<T>(sel)!;

  const lokasi = $<HTMLInputElement>('input[name="lokasi"]');
  const durasi = $<HTMLInputElement>('input[name="durasi"]');
  const durasiField = $<HTMLElement>('[data-durasi]');
  const estimateEl = $<HTMLElement>('[data-estimate]');
  const hintEl = $<HTMLElement>('[data-hint]');
  const stepMinus = $<HTMLButtonElement>('[data-step="-1"]');
  const stepPlus = $<HTMLButtonElement>('[data-step="1"]');
  const defaultHint = hintEl.textContent ?? '';

  const estimateDaysEl = form.querySelector<HTMLElement>('[data-estimate-days]');
  const mobilField = form.querySelector<HTMLElement>('[data-picker="mobil"]');
  const tanggalField = $<HTMLElement>('[data-picker="tanggal"]');
  const jamField = $<HTMLElement>('[data-picker="jam"]');
  const toPicker = (field: HTMLElement): Picker => ({
    field,
    trigger: field.querySelector<HTMLButtonElement>('[data-trigger]')!,
    panel: field.querySelector<HTMLElement>('[data-panel]')!,
  });
  const pickers = [mobilField, tanggalField, jamField].filter((f): f is HTMLElement => !!f).map(toPicker);
  const pickerOf = (field: HTMLElement) => pickers.find((p) => p.field === field)!;

  const { close } = createPopovers(pickers);
  const layanan = () => (form.elements.namedItem('layanan') as RadioNodeList).value;

  const clampDurasi = () => {
    const n = Math.min(MAX_DURASI, Math.max(1, Math.round(Number(durasi.value) || 1)));
    durasi.value = String(n);
    stepMinus.disabled = n <= 1;
    stepPlus.disabled = n >= MAX_DURASI;
    return n;
  };

  // Halaman detail: mobil sudah tetap, data harga ada di data-* form.
  const fixedCar = document.createElement('span');
  Object.assign(fixedCar.dataset, { value: form.dataset.car ?? '', lk: form.dataset.lk ?? '', ds: form.dataset.ds ?? '' });
  const mobil = mobilField
    ? setupListbox(mobilField, () => updateEstimate(), close)
    : { onOpen: () => {}, selected: () => fixedCar };
  const jam = setupListbox(jamField, () => {}, close);

  const today = startOfDay(new Date());
  const tanggal = setupCalendar(
    tanggalField,
    today,
    addDays(today, 365),
    addDays(today, 1),
    () => tanggalField.classList.remove('has-error'),
    close,
  );

  if (mobilField) pickerOf(mobilField).onOpen = mobil.onOpen;
  pickerOf(tanggalField).onOpen = tanggal.onOpen;
  pickerOf(jamField).onOpen = jam.onOpen;

  function updateEstimate(): string {
    const opt = mobil.selected();
    const isBandara = layanan() === LAYANAN_BANDARA;
    const isLepasKunci = layanan() === LAYANAN_LEPAS_KUNCI;
    const key = isLepasKunci ? 'lk' : 'ds';
    const hari = clampDurasi();

    durasiField.hidden = isBandara;
    durasi.disabled = isBandara;

    let estimate: string;
    let hint = defaultHint;

    if (isBandara) {
      estimate = 'Sesuai jarak';
      hint = 'Tarif antar jemput bandara tergantung jarak. Admin kirim harga pasti di WhatsApp.';
    } else if (!opt?.dataset.value && mobilField) {
      const prices = Array.from(mobilField.querySelectorAll<HTMLElement>('[role="option"]'))
        .map((o) => Number(o.dataset[key]))
        .filter((n) => n > 0);
      estimate = prices.length ? `Mulai ${rupiah(Math.min(...prices))}/hari` : 'Tanya admin';
      hint = 'Belum tahu mau mobil apa? Biarkan "Bantu pilihkan", admin kasih rekomendasi.';
    } else if (!opt) {
      estimate = 'Tanya admin';
    } else {
      const harga = Number(opt.dataset[key]) || 0;
      if (harga) {
        estimate = rupiah(harga * hari);
      } else {
        estimate = isLepasKunci ? 'Hanya dengan sopir' : 'Hanya lepas kunci';
        hint = `${opt.dataset.value} ${isLepasKunci ? 'hanya tersedia dengan sopir' : 'hanya tersedia lepas kunci'}. Ganti jenis layanan di atas.`;
      }
    }

    if (estimateDaysEl) estimateDaysEl.textContent = isBandara ? 'sekali jalan' : `${hari} hari`;
    estimateEl.textContent = estimate;
    hintEl.textContent = hint;
    return estimate;
  }

  // Validasi inline berbahasa Indonesia.
  const setError = (field: HTMLElement, control: HTMLElement, bad: boolean) => {
    field.classList.toggle('has-error', bad);
    control.setAttribute('aria-invalid', String(bad));
  };

  form.addEventListener('input', (e) => {
    if (e.target === lokasi && lokasi.value.trim().length >= 3) setError(lokasi.closest('.field')!, lokasi, false);
    if (e.target === durasi) updateEstimate();
  });

  form.addEventListener('change', (e) => {
    if ((e.target as HTMLInputElement).name === 'layanan') updateEstimate();
    if (e.target === durasi) updateEstimate();
  });

  form.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((btn) =>
    btn.addEventListener('click', () => {
      durasi.value = String((Number(durasi.value) || 1) + Number(btn.dataset.step));
      updateEstimate();
    }),
  );

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    close();

    const lokasiBad = lokasi.value.trim().length < 3;
    setError(lokasi.closest('.field')!, lokasi, lokasiBad);
    if (lokasiBad) {
      lokasi.focus();
      return;
    }

    const clean = (v: string) => v.trim().replace(/\s+/g, ' ').slice(0, 120);
    const svc = layanan();
    const estimate = updateEstimate();
    const opt = mobil.selected();

    const lines = [
      `Halo Admin ${form.dataset.name}, saya mau pesan mobil:`,
      '',
      `Layanan: ${svc}`,
      `Mobil: ${opt?.dataset.value || 'Belum tahu, minta rekomendasi'}`,
      `Tanggal: ${fmtLong(tanggal.value())}`,
      `Jam jemput: ${jam.selected()?.dataset.value ?? ''} WIB`,
      `Lokasi jemput: ${clean(lokasi.value)}`,
    ];
    if (svc !== LAYANAN_BANDARA) lines.push(`Durasi: ${clampDurasi()} hari`);
    if (estimate.startsWith('Rp')) lines.push(`Estimasi di web: ${estimate}`);
    lines.push('', 'Apakah tersedia? Terima kasih.', form.dataset.tag ?? '');

    const url = `https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(lines.join('\n'))}`;
    // window.open(..., 'noopener') selalu mengembalikan null, jadi pakai klik anchor (masih dalam user gesture).
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  });

  updateEstimate();
  form.classList.add('is-ready');
}
