
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

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
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [txId, setTxId] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  // gera um QR scaneável com a lib qrcode
  const generateQrDataUrl = async (text, opts = { width: 180 }) => {
    try {
      return await QRCode.toDataURL(String(text), { width: opts.width, margin: 1 });
    } catch (e) {
      return null;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = async () => {
    // tenta gerar QR e incluir txId e JSON em um arquivo simples (PNG download não trivial sem html2canvas)
    const payload = `TX:${txId}\n${response || ''}`;
    const blob = new Blob([payload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprovante_${txId || 'pedido'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCard = (idx) => {
    setSelected(idx);
    setQuantity(1);
    setResponse('');
    setResponseData(null);
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
        setResponseData(data);
  // gerar txId simples (hash curto)
  const seed = `${data.product_id}-${Date.now()}-${Math.random()}`;
  const short = btoa(seed).replace(/=|\/+|\+/g, '').slice(0, 12);
  setTxId(short);
        setResponse(JSON.stringify(data, null, 2));
      } catch (err) {
        setResponseData(null);
        setResponse(`Resposta bruta do backend:\n${text}`);
      }
    } catch (err) {
      setResponse(`Erro: ${err.message}`);
      } finally {
      setLoading(false);
      // aciona animação de impressão quando houver resposta JSON
      setShowPrint(false);
      setTimeout(() => setShowPrint(true), 60);
    }
  };

  // quando txId muda, gera QR data url
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!txId) {
        if (mounted) setQrDataUrl(null);
        return;
      }
      const url = await generateQrDataUrl(txId, { width: 180 });
      if (mounted) setQrDataUrl(url);
    })();
    return () => { mounted = false; };
  }, [txId]);

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
        <style>{`@media print{body *{visibility:hidden} .print-area, .print-area *{visibility:visible} .print-area{position:fixed;left:0;top:0;width:100%}}`}</style>
        {responseData ? (
          <div style={{ marginTop: 28, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div className="print-area" style={{ width: '100%', maxWidth: 360, background: '#fff6d6', borderRadius: 10, padding: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.08)', color: '#3b2f1f' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#3b2f1f' }}>Radio Café</div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 900, fontSize: 20 }}>Cupom Fiscal</div>
                <div style={{ fontSize: 12, color: '#6b5b3b' }}>Operador: Radio Café</div>
              </div>

              <div style={{ background: '#fff8e6', borderRadius: 6, padding: 12, border: '1px solid #f1e1b8' }}>
                <div style={{ fontSize: 12, color: '#6b5b3b', marginBottom: 10 }}>ID Transação: <strong style={{ fontFamily: 'monospace' }}>{txId}</strong></div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{responseData.product_name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: '#6b5b3b' }}>Quantidade</div>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>{responseData.quantity}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed #f1e1b8' }}>
                  <div style={{ fontSize: 12, color: '#6b5b3b' }}>Status</div>
                  <div style={{ fontSize: 12, fontWeight: 900 }}>{String(responseData.status || '').toUpperCase()}</div>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: '#6b5b3b' }}>Data: {new Date().toLocaleString()}</div>
              </div>

              <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: '#6b5b3b' }}>
                <div>Este comprovante é meramente informativo.</div>
                <div style={{ marginTop: 6, fontWeight: 700 }}>{response}</div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                {qrDataUrl && (
                  <img alt="qr" src={qrDataUrl} width={72} height={72} style={{ borderRadius: 6, background: '#fff' }} />
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={handlePrint} style={{ padding: '8px 12px', background: '#c97d3d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}>Imprimir</button>
                  <button type="button" onClick={handleDownloadPng} style={{ padding: '8px 12px', background: '#f0e6b8', color: '#3b2f1f', border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}>Salvar (txt)</button>
                </div>
              </div>
            </div>
          </div>
        ) : response ? (
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
        ) : null}
      </div>
    </div>
  );
}
