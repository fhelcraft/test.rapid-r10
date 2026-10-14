import { useCallback, useEffect, useRef, useState } from 'react';

export interface GalleryItem {
	id: number;
	tag: string;
	date: string;
	place: string;
	title: string;
	summary: string;
	href: string;
	alt: string;
	src: string;
}

const STEP = 32; // degrees between frames on the rotunda wall
const AUTOPLAY_MS = 6000;

const mod = (n: number, m: number) => ((n % m) + m) % m;

export default function MuseumCarousel({ items }: { items: GalleryItem[] }) {
	const n = items.length;
	const room = useRef<HTMLDivElement>(null);
	const frames = useRef<(HTMLLIElement | null)[]>([]);
	const pos = useRef(0); // animated position, in frames
	const target = useRef(0);
	const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
	const suppressClickUntil = useRef(0);
	const [active, setActive] = useState(0);
	const [paused, setPaused] = useState(false);
	const [still, setStill] = useState(false);

	// Lay every frame on the inside of a cylinder around the viewer
	const layout = useCallback(() => {
		const el = room.current;
		if (!el) return;
		const w = el.clientWidth;
		const cardW = Math.min(420, Math.max(250, w * 0.34));
		const radius = cardW * 2.3;
		el.style.setProperty('--card-w', `${cardW}px`);
		frames.current.forEach((f, i) => {
			if (!f) return;
			const off = mod(i - pos.current + n / 2, n) - n / 2;
			const abs = Math.abs(off);
			const angle = -off * STEP;
			f.style.transform = `translateZ(${radius}px) rotateY(${angle}deg) translateZ(${-radius}px)`;
			f.style.opacity = String(Math.max(0, Math.min(1, 2.4 - abs)));
			f.style.setProperty('--lit', String(Math.max(0, 1 - abs)));
			f.style.visibility = abs > 2.4 ? 'hidden' : 'visible';
			f.style.zIndex = String(10 - Math.round(abs));
		});
	}, [n]);

	// Spring the position toward the target
	useEffect(() => {
		let raf = 0;
		const tick = () => {
			if (!drag.current) {
				const d = target.current - pos.current;
				pos.current += still ? d : d * 0.085;
				if (Math.abs(d) < 0.0005) pos.current = target.current;
			}
			layout();
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		window.addEventListener('resize', layout);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', layout);
		};
	}, [layout, still]);

	const go = useCallback(
		(to: number) => {
			target.current = to;
			setActive(mod(Math.round(to), n));
		},
		[n],
	);

	useEffect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		setStill(mq.matches);
	}, []);

	useEffect(() => {
		if (paused || still) return;
		const id = window.setInterval(() => {
			if (!document.hidden) go(Math.round(target.current) + 1);
		}, AUTOPLAY_MS);
		return () => window.clearInterval(id);
	}, [paused, still, go]);

	const onPointerDown = (e: React.PointerEvent) => {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		drag.current = { x: e.clientX, start: pos.current, moved: false };
	};
	const onPointerMove = (e: React.PointerEvent) => {
		const d = drag.current;
		if (!d || !room.current) return;
		const dx = e.clientX - d.x;
		if (Math.abs(dx) > 6 && !d.moved) {
			d.moved = true;
			room.current.setPointerCapture(e.pointerId);
		}
		if (d.moved) {
			const cardW = parseFloat(room.current.style.getPropertyValue('--card-w')) || 360;
			pos.current = d.start - dx / (cardW * 1.1);
		}
	};
	const onPointerUp = () => {
		const d = drag.current;
		drag.current = null;
		if (d?.moved) {
			suppressClickUntil.current = performance.now() + 300;
			go(Math.round(pos.current));
		}
	};
	// Swallow the click that ends a drag so it doesn't open the article
	const onClickCapture = (e: React.MouseEvent) => {
		if (performance.now() < suppressClickUntil.current) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			go(Math.round(target.current) + 1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			go(Math.round(target.current) - 1);
		}
	};

	// Move to the nearest copy of index i (keeps rotation direction short)
	const goTo = (i: number) => {
		const cur = Math.round(target.current);
		const delta = mod(i - cur + n / 2, n) - n / 2;
		go(cur + delta);
	};

	return (
		<div
			className="museum"
			role="region"
			aria-roledescription="carousel"
			aria-label="News and stories"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocus={() => setPaused(true)}
			onBlur={() => setPaused(false)}
			onKeyDown={onKeyDown}
		>
			<div
				ref={room}
				className="museum-room"
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
				onClickCapture={onClickCapture}
			>
				<ul className="museum-wall">
					{items.map((item, i) => (
						<li
							key={item.id}
							ref={(el) => {
								frames.current[i] = el;
							}}
							className="museum-frame"
							aria-roledescription="slide"
							aria-label={`${i + 1} of ${n}`}
						>
							<a
								href={item.href}
								target="_blank"
								rel="noopener"
								draggable={false}
								onFocus={() => goTo(i)}
								aria-label={`${item.title} (opens dtirapid.ph in a new tab)`}
							>
								<span className="spot" aria-hidden="true" />
								<span className="frame">
									<span className="mat">
										<img src={item.src} alt={item.alt} loading="lazy" draggable={false} />
									</span>
								</span>
								<span className="placard">
									<span className="placard-meta">
										<span className={`tag tag-${item.tag.toLowerCase()}`}>{item.tag}</span>
										<span>{item.date}</span>
									</span>
									<span className="placard-title">{item.title}</span>
									<span className="placard-place">{item.place}</span>
								</span>
							</a>
						</li>
					))}
				</ul>
				<div className="museum-floor" aria-hidden="true" />
			</div>

			<div className="museum-controls">
				<button type="button" onClick={() => go(Math.round(target.current) - 1)} aria-label="Previous story">
					<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
						<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" />
					</svg>
				</button>
				<ol className="museum-index">
					{items.map((item, i) => (
						<li key={item.id}>
							<button
								type="button"
								aria-label={`Show story ${i + 1}: ${item.title}`}
								aria-current={i === active ? 'true' : undefined}
								onClick={() => goTo(i)}
							/>
						</li>
					))}
				</ol>
				<button type="button" onClick={() => go(Math.round(target.current) + 1)} aria-label="Next story">
					<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
						<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" />
					</svg>
				</button>
			</div>

			<p className="museum-live" aria-live="polite">
				{items[active].summary}
			</p>
		</div>
	);
}
