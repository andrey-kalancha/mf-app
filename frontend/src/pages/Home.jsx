import { Link } from "react-router-dom";
import "./Home.css";

const categories = [
  {
    title: "Системы открывания",
    text: "Газлифты, подъемники и решения для фасадов.",
    image: "/catalog-assets/generated/opening-systems.png",
  },
  {
    title: "Системы выдвижения",
    text: "Шариковые и скрытые направляющие для ящиков и корпусов.",
    image: "/catalog-assets/generated/drawer-systems.png",
  },
  {
    title: "Посудосушители",
    text: "Верхние и нижние решения для кухни и шкафов.",
    image: "/catalog-assets/generated/dish-dryers.png",
  },
  {
    title: "Бутылочницы",
    text: "Выдвижные системы хранения для кухни.",
    image: "/catalog-assets/generated/bottle-holders.png",
  },
  {
    title: "Крепежная фурнитура",
    text: "Евровинты, саморезы, стяжки и монтажные позиции.",
    image: "/catalog-assets/generated/fasteners.png",
  },
  {
    title: "Комплектующие для шкафов",
    text: "Навесы, штанги, подвески и крепежные полосы.",
    image: "/catalog-assets/generated/wardrobe-components.png",
  },
];

const lines = [
  {
    name: "Standard",
    text: "Базовая линейка для серийной комплектации и понятной закупки.",
  },
  {
    name: "Maxima",
    text: "Плавное закрывание и более комфортная механика.",
  },
  {
    name: "Promax",
    text: "Системы хранения и решения для кухни и шкафов.",
  },
];

const steps = [
  "Подбор по артикулу, категории и линейке",
  "Проверка наличия, упаковок и технических параметров",
  "Счёт или коммерческое предложение",
  "Отгрузка по Алматы и Казахстану",
];

export default function Home() {
  return (
    <section className="home-page">
      <div className="home-hero">
        <div className="home-hero__overlay" />

        <div className="home-hero__inner">
          <div className="home-kicker">МФ Алматы / Lanttich</div>
          <h1>Мебельная фурнитура для производства и закупки без лишних шагов</h1>
          <p>
            Каталог собран по рабочим группам: открывание, выдвижение,
            хранение, крепеж и комплектующие для шкафов. Так проще подобрать
            позиции, сверить параметры и сразу собрать заказ.
          </p>

          <div className="home-hero__actions">
            <Link to="/catalog" className="home-btn">
              Открыть каталог
            </Link>
            <Link to="/contacts" className="home-btn home-btn--ghost">
              Связаться
            </Link>
          </div>

          <div className="home-hero__facts">
            <span>
              <strong>100+</strong>
              позиций и технических параметров в каталоге
            </span>
            <span>
              <strong>3</strong>
              линейки Lanttich для разных сценариев сборки
            </span>
            <span>
              <strong>KZ</strong>
              отгрузка по Алматы и регионам Казахстана
            </span>
          </div>
        </div>
      </div>

      <div className="home-strip">
        <div>
          <span>Официальный представитель</span>
          <strong>Lanttich в Казахстане</strong>
        </div>
        <div>
          <span>Для заказов</span>
          <strong>+7 777 488 88 54</strong>
        </div>
        <div>
          <span>Адрес</span>
          <strong>Алматы, Ратушного 78А/1, оф.308</strong>
        </div>
      </div>

      <section className="home-section">
        <div className="home-section__head">
          <div className="home-kicker">Каталог</div>
          <h2>Основные группы каталога</h2>
          <p>
            На витрине собраны реальные разделы, с которыми удобно работать
            производству, магазинам и частным мастерам.
          </p>
        </div>

        <div className="home-category-grid">
          {categories.map((item) => (
            <Link to="/catalog" className="home-category-tile" key={item.title}>
              <img src={item.image} alt={item.title} />
              <span>{item.title}</span>
              <p>{item.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__head">
          <div className="home-kicker">Линейки</div>
          <h2>Standard, Maxima и Promax</h2>
        </div>

        <div className="home-lines__grid">
          {lines.map((line) => (
            <article className="home-line-panel" key={line.name}>
              <span>{line.name}</span>
              <p>{line.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-b2b-band">
        <div className="home-b2b-band__content">
          <div className="home-kicker">B2B</div>
          <h2>Каталог работает как основа для счёта и спецификации</h2>
          <p>
            Менеджеру удобно быстро сверить позиции по артикулам, упаковкам и
            параметрам, а клиенту проще сразу собрать понятный список для
            закупки.
          </p>
          <Link to="/b2b" className="home-btn">
            B2B условия
          </Link>
        </div>

        <div className="home-steps">
          {steps.map((step, index) => (
            <div className="home-step" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
