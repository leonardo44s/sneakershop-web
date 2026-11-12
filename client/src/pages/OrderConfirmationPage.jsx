import { useParams } from 'react-router-dom';

export default function OrderConfirmationPage() {
  const { codigo } = useParams();
  return <h1>Pedido {codigo}</h1>;
}