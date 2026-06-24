import CarouselCard from "@/components/CarouselCard";
import { SAMPLE } from "@/lib/sample";

// Página só pra screenshot/verificação — cards em tamanho real (1080x1350).
export default function Preview() {
  return (
    <div style={{ background: "#000", display: "flex", flexDirection: "column", gap: 40, padding: 40 }}>
      {SAMPLE.cards.map((c, i) => (
        <div id={`card-${i}`} key={c.id} style={{ width: 1080, height: 1350, flexShrink: 0 }}>
          <CarouselCard card={c} />
        </div>
      ))}
    </div>
  );
}
