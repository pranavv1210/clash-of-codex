"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  Camera,
  Gauge,
  Grid3X3,
  Moon,
  RefreshCw,
  Sun,
} from "lucide-react";
import { Button, IconButton, Panel, Select } from "@/components/ui";
import type { CameraPreset } from "@/world/camera/CityCamera";
import type { QualityTier } from "@/world/quality/tiers";
import { autoQuality } from "@/world/quality/tiers";
import type { WorldStyle } from "@/world/palette";
import "./showroom.css";
const Scene = dynamic(() => import("@/world/ShowroomScene"), {
  ssr: false,
  loading: () => (
    <div className="showroom-loading">Preparing procedural scene…</div>
  ),
});
type Perf = {
  fps: number;
  ms: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
};
export default function Showroom() {
  const [seedInput, setSeedInput] = useState("codex-archipelago"),
    [seed, setSeed] = useState(seedInput),
    [style, setStyle] = useState<WorldStyle>("cyan"),
    [night, setNight] = useState(false),
    [tier, setTier] = useState<QualityTier>("medium"),
    [preset, setPreset] = useState<CameraPreset>("far"),
    [perf, setPerf] = useState<Perf | null>(null),
    [ready, setReady] = useState(false),
    [showPerf, setShowPerf] = useState(true),
    [wireframe, setWireframe] = useState(false);
  useEffect(() => {
    setTier(autoQuality(innerWidth, navigator.maxTouchPoints > 0));
    if (innerWidth <= 600) setShowPerf(false);
  }, []);
  return (
    <main className="showroom" data-scene-ready={ready}>
      <Scene
        seed={seed}
        style={style}
        night={night}
        tier={tier}
        preset={preset}
        wireframe={wireframe}
        onPerf={setPerf}
        onReady={() => setReady(true)}
      />
      <Panel className="showroom-panel">
        <div className="showroom-title">
          <span>
            <b>Floating-island showroom</b>
            <small>Procedural art kit · crew stand-ins</small>
          </span>
          <IconButton
            label={night ? "Use dusk" : "Use night"}
            onClick={() => setNight((v) => !v)}
          >
            {night ? <Sun size={15} /> : <Moon size={15} />}
          </IconButton>
        </div>
        <label className="label">Camera preset</label>
        <div className="preset-grid">
          {(["far", "mid", "close", "top", "night"] as CameraPreset[]).map(
            (p) => (
              <Button
                key={p}
                variant={preset === p ? "primary" : "ghost"}
                onClick={() => {
                  setPreset(p);
                  if (p === "night") setNight(true);
                }}
              >
                {p}
              </Button>
            ),
          )}
        </div>
        <label className="label">Render quality</label>
        <Select
          aria-label="Render quality"
          value={tier}
          onChange={(e) => setTier(e.target.value as QualityTier)}
        >
          {["low", "medium", "high", "ultra"].map((q) => (
            <option key={q}>{q}</option>
          ))}
        </Select>
        <label className="label">Energy style</label>
        <div className="style-row">
          <Button
            variant={style === "cyan" ? "secondary" : "ghost"}
            onClick={() => setStyle("cyan")}
          >
            Crystal cyan
          </Button>
          <Button
            variant={style === "amber" ? "secondary" : "ghost"}
            onClick={() => setStyle("amber")}
          >
            Warm amber
          </Button>
        </div>
        <label className="label">World seed</label>
        <div className="seed-row">
          <input
            className="ui-input"
            aria-label="World seed"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
          />
          <IconButton label="Regenerate" onClick={() => setSeed(seedInput)}>
            <RefreshCw size={15} />
          </IconButton>
        </div>
        <div className="style-row">
          <Button variant="ghost" onClick={() => setShowPerf((v) => !v)}>
            <Gauge size={14} /> Perf
          </Button>
          <Button variant="ghost" onClick={() => setWireframe((v) => !v)}>
            <Grid3X3 size={14} /> Wireframe
          </Button>
        </div>
      </Panel>
      {showPerf && perf && (
        <div className="perf-overlay">
          <span>{perf.fps} fps</span>
          <span>{perf.ms} ms</span>
          <span>{perf.calls} calls</span>
          <span>{perf.triangles.toLocaleString()} tris</span>
          <span>{perf.geometries} geo</span>
          <span>{perf.textures} tex</span>
        </div>
      )}
      <div className="showroom-hint">
        <Camera size={13} /> drag to orbit · scroll to zoom · right-drag to pan
      </div>
    </main>
  );
}
