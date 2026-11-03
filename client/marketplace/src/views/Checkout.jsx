import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { crearNuevaOrden } from '../redux/slice/ordenesSlice'
import { vaciar } from '../redux/slice/carritoSlice'
import { nombreProvincia, PROVINCIAS } from '../api/ordenes'
import './Checkout.css'

function Checkout({ user }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const cart = useSelector(state => state.carrito.items)

    const [entrega, setEntrega] = useState({ provinciaEntrega: '', localidadEntrega: '', direccionEntrega: user?.direccion || '' })

    const [tarjeta, setTarjeta] = useState({
        numero: '',
        titular: '',
        vencimiento: '',
        cvv: ''
    })

    const [error, setError] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [ordenesCreadas, setOrdenesCreadas] = useState(null)

    const seDespacha = (item) => item.conEnvio

    const agruparPaquetes = () => {
        const paquetes = []
        const despacho = cart.filter(seDespacha)
        const coordinar = cart.filter(item => !seDespacha(item))
        if (despacho.length > 0) paquetes.push({ tipo: 'envio', items: despacho })
        if (coordinar.length > 0) paquetes.push({ tipo: 'retiro', items: coordinar })
        return paquetes
    }

    const paquetes = agruparPaquetes()
    const hayDespacho = paquetes.some(p => p.tipo === 'envio')
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
    const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount || 0)

    // Validación de campos vacíos para deshabilitar el botón
    const faltanDatosEnvio = hayDespacho && (!entrega.provinciaEntrega || !entrega.localidadEntrega.trim() || !entrega.direccionEntrega.trim())
    const faltanDatosTarjeta = !tarjeta.numero.trim() || !tarjeta.titular.trim() || !tarjeta.vencimiento.trim() || !tarjeta.cvv.trim()

    const botonDeshabilitado = enviando || faltanDatosEnvio || faltanDatosTarjeta

    if (ordenesCreadas) {
        return (
            <div className="error-overlay">
                <div className="error-modal">
                    <div className="error-icon-box" style={{ backgroundColor: '#16a34a', color: '#ffffff', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}>
                        <i className="fa-solid fa-check"></i>
                    </div>
                    <h2 className="error-title">¡Compra Exitosa!</h2>
                    <p className="error-text">
                        Se {ordenesCreadas.length === 1 ? 'generó 1 orden' : `generaron ${ordenesCreadas.length} órdenes`}.
                        Quedan pendientes de pago.
                    </p>
                    <ul className="checkout-ordenes-creadas">
                        {ordenesCreadas.map(orden => (
                            <li key={orden.id}>
                                <span>Orden #{orden.id} · {orden.vendedor?.nombreUsuario}</span>
                                <strong>{formatMoney(orden.total)}</strong>
                            </li>
                        ))}
                    </ul>
                    <button className="error-btn" style={{ backgroundColor: '#16a34a', color: '#ffffff' }} onClick={() => navigate('/mis-compras')}>Ir a Mis Compras</button>
                </div>
            </div>
        )
    }

    if (cart.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <i className="fa-solid fa-cart-arrow-down" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '16px' }}></i>
                <h2 style={{ color: '#111827' }}>No hay nada para pagar</h2>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>Tu carrito está vacío.</p>
                <button className="error-btn" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => navigate('/home')}>Volver al inicio</button>
            </div>
        )
    }

    const handlePay = async () => {
        setError('')
        setEnviando(true)

        // Usamos el Thunk de Redux
        dispatch(crearNuevaOrden(hayDespacho ? entrega : {}))
            .unwrap()
            .then((ordenes) => {
                setOrdenesCreadas(ordenes)
                dispatch(vaciar()) // Vaciamos el carrito desde Redux
            })
            .catch((err) => {
                setError(err.message || 'Error al procesar la compra')
            })
            .finally(() => {
                setEnviando(false)
            })
    }

    return (
        <div className="checkout-container">
            <div className="checkout-left">
                <h2 className="checkout-section-title">Revisa tu compra</h2>

                {hayDespacho && (
                    <section className="paquete-card">
                        <h3 className="paquete-title" style={{ marginBottom: '4px' }}>¿A dónde te lo enviamos?</h3>
                        <p className="paquete-subtitle">Para los productos con envío. Los que no tienen envío se coordinan con el vendedor.</p>
                        <div className="address-input-container">
                            <label htmlFor="provincia">PROVINCIA</label>
                            <select id="provincia" value={entrega.provinciaEntrega} onChange={e => setEntrega({ ...entrega, provinciaEntrega: e.target.value })}>
                                <option value="">Seleccionar...</option>
                                {PROVINCIAS.map(([clave, nombre]) => <option key={clave} value={clave}>{nombre}</option>)}
                            </select>

                            <label htmlFor="localidad">LOCALIDAD</label>
                            <input id="localidad" type="text" value={entrega.localidadEntrega} onChange={e => setEntrega({ ...entrega, localidadEntrega: e.target.value })} />

                            <label htmlFor="direccion">DIRECCIÓN</label>
                            <input id="direccion" type="text" placeholder="Calle y número" value={entrega.direccionEntrega} onChange={e => setEntrega({ ...entrega, direccionEntrega: e.target.value })} />
                        </div>
                    </section>
                )}

                {/* Sección de Tarjeta de Crédito / Débito (Sin validaciones) */}
                <section className="paquete-card">
                    <h3 className="paquete-title" style={{ marginBottom: '4px' }}>Medio de pago</h3>
                    <p className="paquete-subtitle">Ingresá los datos de tu tarjeta para completar la operación.</p>

                    <div className="address-input-container">
                        <label htmlFor="tarjeta-numero">NÚMERO DE TARJETA</label>
                        <input
                            id="tarjeta-numero"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={tarjeta.numero}
                            onChange={e => setTarjeta({ ...tarjeta, numero: e.target.value })}
                        />

                        <label htmlFor="tarjeta-titular">NOMBRE DEL TITULAR</label>
                        <input
                            id="tarjeta-titular"
                            type="text"
                            placeholder="Como figura en la tarjeta"
                            value={tarjeta.titular}
                            onChange={e => setTarjeta({ ...tarjeta, titular: e.target.value })}
                        />

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="tarjeta-vencimiento">VENCIMIENTO</label>
                                <input
                                    id="tarjeta-vencimiento"
                                    type="text"
                                    placeholder="MM/AA"
                                    value={tarjeta.vencimiento}
                                    onChange={e => setTarjeta({ ...tarjeta, vencimiento: e.target.value })}
                                />
                            </div>

                            <div style={{ flex: 1 }}>
                                <label htmlFor="tarjeta-cvv">CVV</label>
                                <input
                                    id="tarjeta-cvv"
                                    type="text"
                                    placeholder="123"
                                    value={tarjeta.cvv}
                                    onChange={e => setTarjeta({ ...tarjeta, cvv: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {paquetes.map((paquete, index) => {
                    const esEnvio = paquete.tipo === 'envio'

                    return (
                        <article className="paquete-card" key={paquete.tipo}>
                            <header className="paquete-header">
                                {esEnvio ? (
                                    <div className="paquete-icon icon-envio"><i className="fa-solid fa-box"></i></div>
                                ) : (
                                    <div className="paquete-icon icon-acordar"><i className="fa-solid fa-handshake"></i></div>
                                )}

                                <div>
                                    <h3 className="paquete-title">Paquete {index + 1}</h3>
                                    {esEnvio ? (
                                        <p className="paquete-subtitle" style={{ color: '#16a34a', fontWeight: 'bold', marginTop: '2px' }}>
                                            Envío a domicilio
                                            {entrega.provinciaEntrega && ` · ${entrega.direccionEntrega ? entrega.direccionEntrega + ', ' : ''}${entrega.localidadEntrega ? entrega.localidadEntrega + ', ' : ''}${nombreProvincia(entrega.provinciaEntrega)}`}
                                        </p>
                                    ) : (
                                        <p className="paquete-subtitle" style={{ color: '#4b5563', fontWeight: 'bold', marginTop: '2px' }}>
                                            Entrega a coordinar con el vendedor
                                        </p>
                                    )}
                                </div>
                            </header>

                            <div className="paquete-items">
                                {paquete.items.map(item => (
                                    <div className="checkout-item" key={item.idItem}>
                                        <div>
                                            <div className="checkout-item-title">{item.title}</div>
                                            <div className="checkout-item-qty">
                                                Cantidad: {item.qty}
                                                {!item.conEnvio && ' · No admite envío'}
                                            </div>
                                        </div>
                                        <div className="checkout-item-price">{formatMoney(item.price * item.qty)}</div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    )
                })}
            </div>

            <div className="checkout-right">
                <h3 className="checkout-section-title">Resumen</h3>
                <div className="summary-row">
                    <span>Productos ({cart.reduce((acc, item) => acc + item.qty, 0)})</span>
                    <span>{formatMoney(subtotal)}</span>
                </div>

                {paquetes.map((paquete, index) => (
                    <div className="summary-row" key={paquete.tipo}>
                        <span>{paquete.tipo === 'envio' ? 'Envío' : 'Entrega'} (Paq. {index + 1})</span>
                        <span style={{ color: paquete.tipo === 'envio' ? '#16a34a' : '#4b5563', fontWeight: '600' }}>
              {paquete.tipo === 'envio' ? 'A domicilio' : 'A coordinar'}
            </span>
                    </div>
                ))}

                <div className="summary-total">
                    <span>Total</span>
                    <span>{formatMoney(subtotal)}</span>
                </div>

                {error && <div className="checkout-error">{error}</div>}

                <button
                    className="btn-pagar"
                    onClick={handlePay}
                    disabled={botonDeshabilitado}
                    title={botonDeshabilitado ? 'Completá los datos requeridos para continuar' : ''}
                >
                    {enviando ? 'PROCESANDO...' : 'CONFIRMAR COMPRA'}
                </button>
                <p className="checkout-aviso">La orden queda pendiente de pago hasta que se acredite.</p>
            </div>
        </div>
    )
}

export default Checkout