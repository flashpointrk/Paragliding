'use client';

/**
 * Weather threshold list manager (client).
 *
 * The list, the CRUD modal and a "suitability test" tool: current conditions
 * are fetched for the selected threshold's coordinate (/api/weather) and the
 * suitability badge is shown.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { ThresholdForm, type ThresholdData } from './ThresholdForm';
import type { WeatherThreshold } from '@prisma/client';
import type { WeatherApiResponse } from '@/lib/weather/types';

export function ThresholdListClient({
  thresholds,
}: {
  thresholds: WeatherThreshold[];
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const [edit, setEditing] = useState<ThresholdData | null>(null);
  const [testId, setTestId] = useState<string | null>(null);

  function refresh() {
    setOpen(false);
    setEditing(null);
    window.location.reload();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete the threshold "${name}"?`)) return;
    const res = await fetch(`/api/admin/weather-thresholds/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      alert(json.message ?? 'Silinemedi.');
      return;
    }
    refresh();
  }

  const columns = [
    {
      header: 'Lokasyon',
      cell: (e: WeatherThreshold) => (
        <div>
          <p className="font-medium text-navy-800">{e.locationName}</p>
          <p className="text-xs text-navy-400">
            {e.lat.toFixed(4)}, {e.lng.toFixed(4)} · heading {e.takeoffHeading}°
          </p>
        </div>
      ),
    },
    {
      header: 'Wind limit',
      cell: (e: WeatherThreshold) => (
        <span className="text-navy-600 text-xs">
          Green {e.windMaxGreen} · Amber {e.windMaxAmber} km/h
        </span>
      ),
      className: 'hidden md:table-cell',
    },
    {
      header: 'Status',
      cell: (e: WeatherThreshold) =>
        e.active ? <Badge variant="green">Active</Badge> : <Badge variant="gray">Inactive</Badge>,
    },
  ];

  const testThreshold = testId ? thresholds.find((e) => e.id === testId) : null;

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          size="sm"
        >
          + New threshold
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={thresholds}
        rowKey={(e) => e.id}
        emptyHeading="No weather threshold defined yet"
        emptyDescription="Define the weather thresholds used for flight suitability."
        actions={(e) => (
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              className="text-sm font-medium text-green-600 hover:text-green-700"
              onClick={() => setTestId(e.id)}
            >
              Test
            </button>
            <button
              type="button"
              className="text-sm font-medium text-sky-600 hover:text-sky-700"
              onClick={() => {
                setEditing({
                  id: e.id,
                  locationName: e.locationName,
                  lat: e.lat,
                  lng: e.lng,
                  takeoffHeading: e.takeoffHeading,
                  windMaxGreen: e.windMaxGreen,
                  windMaxAmber: e.windMaxAmber,
                  gustDeltaMaxGreen: e.gustDeltaMaxGreen,
                  gustDeltaMaxAmber: e.gustDeltaMaxAmber,
                  precipMaxGreen: e.precipMaxGreen,
                  precipMaxAmber: e.precipMaxAmber,
                  visibilityMinGreen: e.visibilityMinGreen,
                  visibilityMinAmber: e.visibilityMinAmber,
                  windSectorMin: e.windSectorMin,
                  windSectorMax: e.windSectorMax,
                  active: e.active,
                });
                setOpen(true);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="text-sm font-medium text-red-600 hover:text-red-700"
              onClick={() => remove(e.id, e.locationName)}
            >
              Delete
            </button>
          </div>
        )}
      />

      {/* CRUD modal */}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={edit?.id ? 'Edit threshold' : 'New threshold'}
        sizeClassName="max-w-3xl"
      >
        <ThresholdForm
          initial={edit}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSuccess={refresh}
        />
      </Modal>

      {/* Uygunluk test modal */}
      <Modal
        open={Boolean(testThreshold)}
        onClose={() => setTestId(null)}
        title={`Uygunluk Testi — ${testThreshold?.locationName ?? ''}`}
      >
        {testThreshold ? <SuitabilityTest lat={testThreshold.lat} lng={testThreshold.lng} /> : null}
      </Modal>
    </>
  );
}

function SuitabilityTest({ lat, lng }: { lat: number; lng: number }) {
  const [data, setData] = useState<WeatherApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`, {
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Could not fetch weather data.');
      setData(json as WeatherApiResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not fetch weather data.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const COLOR: Record<string, string> = {
    green: 'bg-green-100 text-green-800 ring-green-200',
    amber: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    red: 'bg-red-100 text-red-800 ring-red-200',
  };
  const LABEL: Record<string, string> = {
    green: 'Uygun',
    amber: 'Dikkat',
    red: 'Not suitable',
  };

  return (
    <div className="space-y-4">
      <Button onClick={load} size="sm" disabled={loading}>
        {loading ? 'Fetching…' : 'Fetch current weather'}
      </Button>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {data ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${
                COLOR[data.suitability.status] ?? COLOR.amber
              }`}
            >
              {LABEL[data.suitability.status] ?? data.suitability.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-navy-400">Wind</p>
              <p className="font-semibold text-navy-800">
                {data.current.windSpeed} km/h ({data.current.windDirection}°)
              </p>
            </div>
            <div>
              <p className="text-xs text-navy-400">Gust</p>
              <p className="font-semibold text-navy-800">
                {data.current.windGust} km/h
              </p>
            </div>
            <div>
              <p className="text-xs text-navy-400">Temperature</p>
              <p className="font-semibold text-navy-800">
                {data.current.temperature}°C
              </p>
            </div>
            <div>
              <p className="text-xs text-navy-400">Precipitation</p>
              <p className="font-semibold text-navy-800">{data.current.precipitation} mm</p>
            </div>
          </div>
          {data.suitability.description ? (
            <p className="text-sm text-navy-600">{data.suitability.description}</p>
          ) : null}
          {data.suitability.reasons.length > 0 ? (
            <ul className="text-xs text-navy-500 list-disc pl-5 space-y-0.5">
              {data.suitability.reasons.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
