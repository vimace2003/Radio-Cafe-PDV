
import { useState } from 'react';

const produtos = [
  { id: 1, nome: 'X-Burgui', cor: '#F44336' },
  { id: 2, nome: 'X-Salada', cor: '#4CAF50' },
  { id: 3, nome: 'X-Bacon', cor: '#FF9800' },
  { id: 4, nome: 'X-Egg', cor: '#FFEB3B', texto: '#333' },
  { id: 5, nome: 'X-Frango', cor: '#FFC107' },
  { id: 6, nome: 'X-Calabresa', cor: '#E91E63' },
  { id: 7, nome: 'X-Tudo', cor: '#9C27B0' },
  { id: 8, nome: 'Misto Quente', cor: '#795548' },
  { id: 9, nome: 'Coca-Cola', cor: '#B71C1C' },
  { id: 10, nome: 'Suco Laranja', cor: '#FF9800' },
];

export default function App() {
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCard = (idx) => {
    setSelected(idx);
    setQuantity(1);
    setResponse('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected == null) return;
    setLoading(true);
    setResponse('');
    try {
      const prod = produtos[selected];
      const idPadded = String(prod.id).padStart(3, '0');
      const namePadded = prod.nome.padEnd(15, ' ');
      const quantityPadded = String(quantity).padStart(3, '0');
      const payload = idPadded + namePadded + quantityPadded;
      const res = await fetch('http://localhost:8080/cgi-bin/pdv.sh', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: payload,
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        setResponse(JSON.stringify(data, null, 2));
      } catch (err) {
        setResponse(`Resposta bruta do backend:\n${text}`);
      }
    } catch (err) {
      setResponse(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 60% 40%, #ffe7b3 0%, #c97d3d 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Segoe UI, Arial, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 20,
        boxShadow: '0 8px 32px 0 rgba(80, 40, 10, 0.25)',
        padding: 36,
        minWidth: 340,
        maxWidth: 520,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 18,
        }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c97d3d 0%, #ffe7b3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 32,
            color: '#fff',
            boxShadow: '0 2px 8px #c97d3d44',
            border: '2px solid #fff',
          }}>
            <span style={{fontFamily:'serif'}}>☕</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 26, color: '#c97d3d', letterSpacing: 1 }}>Radio Café</div>
            <div style={{ fontWeight: 400, fontSize: 15, color: '#7a4a1a', letterSpacing: 1, marginTop: 2 }}>PDV Restaurante</div>
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 18,
          marginBottom: 32,
          width: '100%',
        }}>
          {produtos.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => handleCard(idx)}
              style={{
                background: selected === idx ? (p.cor || '#c97d3d') : '#f7f7f7',
                color: selected === idx ? (p.texto || '#fff') : '#7a4a1a',
                border: selected === idx ? '2.5px solid #c97d3d' : '1.5px solid #e0e0e0',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 20,
                padding: '26px 0',
                cursor: 'pointer',
                boxShadow: selected === idx ? '0 2px 12px #c97d3d33' : 'none',
                outline: 'none',
                transition: 'all 0.2s',
                width: '100%',
                letterSpacing: 1,
              }}
            >
              {p.nome}
            </button>
          ))}
        </div>
        {selected != null && (
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ color: '#7a4a1a', fontWeight: 600, fontSize: 17, minWidth: 90 }}>Quantidade</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Math.min(999, Number(e.target.value))))}
                min="1"
                max="999"
                required
                style={{
                  width: 90,
                  padding: '12px 16px',
                  border: '1.5px solid #c97d3d',
                  borderRadius: 8,
                  fontSize: 18,
                  background: '#fff8f0',
                  color: '#7a4a1a',
                  outline: 'none',
                  textAlign: 'center',
                  fontWeight: 700,
                  boxShadow: '0 1px 4px #c97d3d22',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px 0',
                background: 'linear-gradient(90deg, #c97d3d 0%, #ffe7b3 100%)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 20,
                border: 'none',
                borderRadius: 10,
                boxShadow: '0 2px 12px #c97d3d33',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: 8,
                letterSpacing: 1,
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Enviando...' : 'Enviar para cozinha'}
            </button>
          </form>
        )}
        {response && (
          <pre style={{
            marginTop: 32,
            width: '100%',
            background: '#c97d3d',
            color: '#fff',
            borderRadius: 10,
            padding: 20,
            fontSize: 16,
            letterSpacing: 0.5,
            overflowX: 'auto',
            fontWeight: 600,
            boxShadow: '0 2px 8px #c97d3d33',
          }}>{response}</pre>
        )}
      </div>
    </div>
  );
}
