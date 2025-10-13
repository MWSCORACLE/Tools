const rowTemplate = document.getElementById('rowTemplate');
const tableBody = document.getElementById('rows');
const lastUpdated = document.getElementById('lastUpdated');
const locationSelect = document.getElementById('loc');
const deltaInput = document.getElementById('thrDelta');
const dosInput = document.getElementById('thrDos');
const refreshBtn = document.getElementById('refreshBtn');

const BADGE_VARIANTS = {
  ok: 'badge--ok',
  warn: 'badge--warn',
  err: 'badge--err',
};

const formatNumber = (value) =>
  Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—';

const makeBadge = (label, variant) => {
  const span = document.createElement('span');
  span.className = `badge ${BADGE_VARIANTS[variant] ?? BADGE_VARIANTS.warn}`;
  span.textContent = label;
  return span;
};

const buildLink = (itemId) =>
  `https://td3012435.app.netsuite.com/app/common/entity/item.nl?id=${encodeURIComponent(itemId)}`;

async function loadData(location = 'all') {
  const params = new URLSearchParams({ location });
  const source = `/inventory/dashboard?${params.toString()}`;

  try {
    const response = await fetch(source, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Falling back to local sample data', error);
    const fallback = await fetch('./data/sample-data.json');
    return fallback.json();
  }
}

function renderLocations(locations = []) {
  locationSelect.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = 'all';
  defaultOption.textContent = 'All Locations';
  locationSelect.append(defaultOption);

  locations.forEach((loc) => {
    if (!loc) return;
    const option = document.createElement('option');
    option.value = loc;
    option.textContent = loc;
    locationSelect.append(option);
  });
}

function computeDelta(last30, prior30) {
  if (prior30 > 0) {
    return ((last30 - prior30) / prior30) * 100;
  }
  return last30 > 0 ? 100 : 0;
}

function renderRows(rows) {
  tableBody.innerHTML = '';
  if (!rows?.length) {
    const emptyRow = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'table__cell';
    cell.textContent = 'No items match the selected filters.';
    emptyRow.append(cell);
    tableBody.append(emptyRow);
    return;
  }

  const deltaThreshold = Number(deltaInput.value) || 30;
  const dosThreshold = Number(dosInput.value) || 0;

  rows.forEach((row) => {
    const template = rowTemplate.content.cloneNode(true);
    const link = template.querySelector('.link');
    link.href = buildLink(row.itemId);
    link.textContent = row.itemName ?? 'Item';

    template.querySelector('[data-field="units90"]').textContent = formatNumber(row.units90 ?? 0);
    template.querySelector('[data-field="last30"]').textContent = formatNumber(row.last30 ?? 0);
    template.querySelector('[data-field="prior30"]').textContent = formatNumber(row.prior30 ?? 0);

    const delta = computeDelta(row.last30 ?? 0, row.prior30 ?? 0);
    let deltaLabel = `${delta.toFixed(0)}%`;
    if ((row.prior30 ?? 0) === 0 && (row.last30 ?? 0) > 0) {
      deltaLabel = 'new';
    }
    template.querySelector('[data-field="delta"]').textContent = deltaLabel;

    const avgDaily = row.avgDaily ?? 0;
    let dosValue = null;
    if (avgDaily > 0) {
      dosValue = (Number(row.onHand ?? 0) + Number(row.onOrder ?? 0)) / avgDaily;
    }

    const dosCell = template.querySelector('[data-field="dos"]');
    dosCell.textContent = Number.isFinite(dosValue) ? dosValue.toFixed(1) : '—';

    const alertsCell = template.querySelector('[data-field="alerts"]');
    alertsCell.className = 'table__cell';
    const badges = document.createElement('span');
    badges.className = 'badges';

    const hasSpike = row.prior30 > 0 && delta >= deltaThreshold;
    const hasDrop = row.prior30 > 0 && delta <= -deltaThreshold;
    const isNew = (row.prior30 ?? 0) === 0 && (row.last30 ?? 0) > 0;

    if (hasSpike || isNew) {
      badges.append(makeBadge(isNew ? 'new' : 'spike', 'warn'));
    }
    if (hasDrop) {
      badges.append(makeBadge('drop', 'err'));
    }

    const leadTime = Number(row.leadTime ?? 0);
    const reorderPoint = Number(row.reorderPoint ?? 0);
    const avgDailyDemand = avgDaily || 0;
    if (Number.isFinite(dosValue)) {
      const reorderCoverage = avgDailyDemand > 0 ? reorderPoint / avgDailyDemand : null;
      const isRisk =
        (dosThreshold > 0 && dosValue < dosThreshold) ||
        (leadTime > 0 && dosValue < leadTime) ||
        (reorderCoverage !== null && dosValue < reorderCoverage);

      if (isRisk) {
        badges.append(makeBadge('coverage risk', 'warn'));
      } else if (dosValue > leadTime * 3 && leadTime > 0) {
        badges.append(makeBadge('healthy', 'ok'));
      }
    }

    if (badges.children.length === 0) {
      badges.append(makeBadge('—', 'warn'));
    }

    alertsCell.append(badges);
    tableBody.append(template);
  });
}

async function refresh() {
  const location = locationSelect.value || 'all';
  const data = await loadData(location);
  if (data.locations) {
    renderLocations(data.locations);
    if (location !== 'all') {
      locationSelect.value = location;
    }
  } else if (!locationSelect.options.length) {
    renderLocations([]);
  }

  const rows = Array.isArray(data.rows) ? data.rows : [];
  const hasLocationField = rows.some((row) => Object.prototype.hasOwnProperty.call(row ?? {}, 'location'));
  const filteredRows =
    location === 'all' || !hasLocationField
      ? rows
      : rows.filter((row) => (row?.location ?? null) === location);

  renderRows(filteredRows);
  lastUpdated.textContent = data.lastRefreshedAt ?? '—';
}

refreshBtn.addEventListener('click', () => {
  refresh();
});

deltaInput.addEventListener('change', refresh);
dosInput.addEventListener('change', refresh);
locationSelect.addEventListener('change', refresh);

refresh();
