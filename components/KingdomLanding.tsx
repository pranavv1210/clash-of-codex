"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowRight, Bot, CheckCircle2, ChevronRight, Code2, Coins, Github,
  Hammer, Layers3, Settings, Sparkles, Swords, Target, Users, Zap
} from "lucide-react";
import Link from "next/link";
import styles from "./KingdomLanding.module.css";

const KingdomScene = dynamic(() => import("@/components/KingdomScene"), {
  ssr: false,
  loading: () => <div className={styles.sceneLoading}>Raising the kingdom…</div>,
});

const builders = [
  { initials: "AR", name: "Architect", task: "Role template", color: "purple" },
  { initials: "CD", name: "Codex Dev", task: "Not connected", color: "green" },
  { initials: "QA", name: "QA Scout", task: "Not connected", color: "blue" },
];

export default function KingdomLanding() {
  return (
    <main className={styles.kingdom}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="Clash of Codex home">
          <span className={styles.crest}><Swords size={23} /></span>
          <span><strong>CLASH OF CODEX</strong><small>YOUR ENGINEERING KINGDOM</small></span>
        </Link>
        <div className={styles.resources}>
          <div className={styles.resource}><span className={styles.gold}><Coins size={18} /></span><span><b>BUILD XP</b><strong>—</strong></span></div>
          <div className={styles.resource}><span className={styles.elixir}><Zap size={18} /></span><span><b>AI ENERGY</b><strong>SETUP</strong></span></div>
          <div className={styles.resource}><span className={styles.builder}><Hammer size={18} /></span><span><b>BUILDERS</b><strong>0/0</strong></span></div>
        </div>
        <div className={styles.actions}>
          <Link href="/workspace" className={styles.githubButton}><Github size={17} /> CONNECT GITHUB</Link>
          <Link href="/workspace" className={styles.settings} aria-label="Settings"><Settings size={19} /></Link>
          <Link href="/workspace" className={styles.profile} aria-label="Open workspace">P</Link>
        </div>
      </header>

      <section className={styles.world}>
        <div className={styles.skyGlow} />
        <div className={styles.scene}>
          <KingdomScene />
        </div>
        <div className={styles.worldVignette} />

        <motion.aside className={styles.leftStack} initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: .55 }}>
          <section className={styles.panel}>
            <div className={styles.panelTitle}><span className={styles.crown}>♛</span><h2>KINGDOM OVERVIEW</h2></div>
            <div className={styles.repoLine}><Github size={16} /><span>Connect a repository to begin</span></div>
            <div className={styles.statGrid}>
              <div><Code2 size={19} /><strong>—</strong><small>PROJECTS</small></div>
              <div><Bot size={19} /><strong>4</strong><small>AGENTS</small></div>
              <div><Target size={19} /><strong>—</strong><small>MISSIONS</small></div>
            </div>
            <div className={styles.ready}><CheckCircle2 size={15} /> YOUR KINGDOM AWAITS</div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelTitle}><span className={styles.questIcon}><Target size={17} /></span><h2>FIRST QUEST</h2></div>
            <h3>Connect your GitHub realm</h3>
            <p>Choose a repository and watch your codebase become a living kingdom.</p>
            <Link href="/workspace" className={styles.questButton}>START QUEST <ChevronRight size={16} /></Link>
          </section>
        </motion.aside>

        <motion.aside className={styles.rightStack} initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: .55, delay: .08 }}>
          <section className={styles.panel}>
            <div className={styles.panelTitle}><Users size={18} /><h2>BUILDER ROLES</h2><span className={styles.count}>PREVIEW</span></div>
            {builders.map((builder) => (
              <div className={styles.builderRow} key={builder.initials}>
                <span className={`${styles.builderAvatar} ${styles[builder.color]}`}>{builder.initials}</span>
                <span className={styles.builderInfo}><strong>{builder.name}</strong><small>{builder.task}</small></span>
                <span className={styles.online} />
              </div>
            ))}
            <Link href="/workspace" className={styles.panelLink}>CONFIGURE BUILDERS <ArrowRight size={13} /></Link>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelTitle}><Sparkles size={17} /><h2>KINGDOM ACTIVITY</h2></div>
            <div className={styles.activity}><span className={styles.activityDot} /><span><strong>Kingdom preview loaded</strong><small>Connect GitHub to create your world</small></span></div>
            <div className={styles.activity}><span className={styles.activityDotMuted} /><span><strong>Agent roles available</strong><small>No agent sessions running</small></span></div>
          </section>
        </motion.aside>

        <div className={styles.cityCaption}><span className={styles.live} /> YOUR KINGDOM · VISUAL PREVIEW</div>
        <div className={styles.sceneHint}>DRAG TO ORBIT <i /> SCROLL TO ZOOM <i /> SELECT A BUILDING</div>
      </section>

      <footer className={styles.commandDock}>
        <div className={styles.level}><span className={styles.star}>★</span><span><small>KINGDOM</small><strong>LEVEL 01</strong></span></div>
        <div className={styles.commandBox}>
          <Sparkles size={18} />
          <span>What shall your builders create today?</span>
          <Link href="/workspace" className={styles.createButton}>CONNECT REPOSITORY <ArrowRight size={16} /></Link>
        </div>
        <Link href="/workspace" className={styles.viewButton}><Layers3 size={16} /> ENTER KINGDOM</Link>
      </footer>
      <div className={styles.mobileNote}>Connect GitHub to generate your own engineering kingdom.</div>
    </main>
  );
}
