import { useParams } from 'react-router-dom';

export default function ProductDetailPage() {
  const { id } = useParams();

  return (
    <section>
      <h1>Detalle del producto</h1>
      <p>Producto número {id}.</p>
    </section>
  );
}
