# AGENCY landing page

AGENCY-ийн MVP (static HTML/CSS/JS)-г Next.js дээр шилжүүлж, `.claude/skills` дахь skill-үүдийн дагуу сайжруулсан хувилбар.

Санаа нь призм: нэг цагаан туяа (санаа) призмээр орж, гурван өнгөт туяа (Growth, Studios, Entertainment) болж гарна. Хуудсан дээрх өнгө зөвхөн эдгээр гурван чиглэлийг илэрхийлнэ.

## Ажиллуулах

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Бүтэц

| Файл | Үүрэг |
| --- | --- |
| `src/app/page.tsx` | Хуудасны бүх хэсэг (Server Component) |
| `src/app/actions.ts` | Үнийн санал хүсэх Server Action, үнийг server дээр дахин тооцно |
| `src/lib/catalog.ts` | Зорилго, модуль, үнэ (client, server хоёулаа ашиглана) |
| `src/components/hero/` | R3F призм сцен (`prism-scene.tsx`), туяаны байрлал (`prism-layout.ts`), GSAP-аар асах хөдөлгөөн (`prism-stage.tsx`) |
| `src/components/builder/` | Багц бүрдүүлэгч, unit tab-ын context |
| `src/components/smooth-scroll.tsx` | Нэг Lenis instance, ScrollTrigger-тэй синк |

## Production-д холбох 3 зүйл

1. `src/app/actions.ts` доторх `TODO(production)` хэсэгт lead-ийг CRM эсвэл form endpoint руу илгээнэ. Одоогоор зөвхөн server log-д бичдэг.
2. `hello@yourdomain.mn`-г (`src/app/page.tsx`) бодит хаягаар, domain-ийг бодит domain-аар солино.
3. `src/lib/catalog.ts` доторх үнийг AGENCY-ийн баталсан price sheet-ээр шинэчилнэ.

## Хөдөлгөөн ба хүртээмж

- Hero-ийн текст CSS animation-аар орж ирнэ, тиймээс хуудас ачаалж байх үед ч гацахгүй.
- 3D сцен ачаалагдсаны дараа туяа асна (GSAP). Hero дэлгэцээс гарвал render зогсоно.
- `prefers-reduced-motion` үед Lenis үүсэхгүй, 3D сцен хөдлөхгүй (нэг кадр зурна), хөдөлгөөнүүд зөвхөн opacity болно.
- WebGL ажиллахгүй бол hero зөвхөн текстээр харагдана.
