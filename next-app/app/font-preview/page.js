"use client";

/**
 * Font Preview Page
 * 
 * Temporary page to compare different font options.
 * Delete this page once you've decided on fonts.
 */

import styles from "./FontPreview.module.css";

export default function FontPreview() {
    return (
        <main className={styles.page}>
            <h1 className={styles.pageTitle}>Inter + Space Grotesk Pairing</h1>

            {/* Navigation Example */}
            <section className={styles.fontSection}>
                <h2 className={styles.sectionLabel}>Navigation</h2>
                <p className={styles.explanation}>All labels: <strong>Inter</strong></p>
                <div className={styles.navPreview}>
                    <span className={styles.navItem}>Home</span>
                    <span className={`${styles.navItem} ${styles.navActive}`}>Matches</span>
                    <span className={styles.navItem}>Teams</span>
                    <span className={styles.navItem}>Settings</span>
                </div>
            </section>

            {/* Match Card Example */}
            <section className={styles.fontSection}>
                <h2 className={styles.sectionLabel}>Match Card</h2>
                <p className={styles.explanation}>Match name, time, badges, scores, LIVE: <strong>Space Grotesk</strong> · VS text: <strong>Inter</strong></p>
                <div className={styles.matchCard}>
                    <div className={styles.matchHeader}>
                        <span className={styles.matchName}>Q7</span>
                        <span className={styles.matchTime}>9:48 AM</span>
                        <span className={styles.liveBadge}>● LIVE</span>
                    </div>
                    <div className={styles.matchBody}>
                        <div className={styles.alliance}>
                            <div className={styles.teamBadges}>
                                <span className={styles.badgeRed}>9999A</span>
                                <span className={styles.badgeRed}>7862E</span>
                            </div>
                            <span className={styles.score}>42</span>
                        </div>
                        <span className={styles.vs}>VS</span>
                        <div className={styles.alliance}>
                            <div className={styles.teamBadges}>
                                <span className={styles.badgeBlue}>52558A</span>
                                <span className={styles.badgeBlue}>1234B</span>
                            </div>
                            <span className={`${styles.score} ${styles.winning}`}>66</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Card Example */}
            <section className={styles.fontSection}>
                <h2 className={styles.sectionLabel}>Team Card</h2>
                <p className={styles.explanation}>Team number, stat values: <strong>Space Grotesk</strong> · Team name, labels: <strong>Inter</strong></p>
                <div className={styles.teamCard}>
                    <span className={styles.teamNumber}>1234A</span>
                    <span className={styles.teamName}>Robo Warriors</span>
                    <div className={styles.teamStats}>
                        <span className={styles.stat}>Rank <strong>#3</strong></span>
                        <span className={styles.stat}>Record <strong>5-2-0</strong></span>
                    </div>
                </div>
            </section>

            {/* Search Bar Example */}
            <section className={styles.fontSection}>
                <h2 className={styles.sectionLabel}>Search</h2>
                <p className={styles.explanation}>Placeholder and input text: <strong>Inter</strong></p>
                <div className={styles.searchWrapper}>
                    <input 
                        type="text" 
                        placeholder="Filter by number or team name..." 
                        className={styles.searchInput}
                    />
                </div>
            </section>

            {/* Stats/Numbers Example */}
            <section className={styles.fontSection}>
                <h2 className={styles.sectionLabel}>Stats Display</h2>
                <p className={styles.explanation}>Stat values: <strong>Space Grotesk</strong> · Labels: <strong>Inter</strong></p>
                <div className={styles.statsGrid}>
                    <div className={styles.statBox}>
                        <span className={styles.statLabel}>Matches Played</span>
                        <span className={styles.statValue}>24</span>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.statLabel}>Win Rate</span>
                        <span className={styles.statValue}>71.4%</span>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.statLabel}>Avg Score</span>
                        <span className={styles.statValue}>48.5</span>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.statLabel}>Ranking</span>
                        <span className={styles.statValue}>#3</span>
                    </div>
                </div>
            </section>

            {/* Body Text Example */}
            <section className={styles.fontSection}>
                <h2 className={styles.sectionLabel}>Body Text</h2>
                <p className={styles.explanation}>All body/paragraph text: <strong>Inter</strong></p>
                <p className={styles.bodyText}>
                    Welcome to VEX Emcee! This app helps tournament emcees quickly look up match information and team stats during live events. Select your event to get started.
                </p>
            </section>
        </main>
    );
}
