import { Link } from "react-router-dom";
import "./About.css";

const principles = [
  {
    title: "Каталог по рабочим группам",
    text: "Разделы собраны так, как с ними удобно работать в мебели: открывание, выдвижение, хранение, крепеж и комплектующие.",
  },
  {
    title: "Технический подбор",
    text: "В карточках используются артикулы, размеры, нагрузка, упаковки, покрытие и дополнительные параметры.",
  },
  {
    title: "Поставка под заказ",
    text: "Клиент быстро собирает позиции, а менеджер подготавливает счет, спецификацию и отгрузку.",
  },
];

const assortment = [
  "Газлифты и подъемные механизмы",
  "Системы выдвижения",
  "Посудосушители ALBA",
  "Бутылочницы Promax",
  "Крепежная фурнитура",
  "Комплектующие для шкафов",
];

const serviceItems = [
  "Подбор по артикулу",
  "Проверка упаковок и наличия",
  "Технические файлы и чертежи",
  "Счет и спецификация",
];

export default function About() {
  return (
    <section className="about-page">
      <div className="about-hero">
        <div className="about-hero__text">
          <div className="about-kicker">О компании</div>
          <h1>МФ Алматы поставляет мебельную фурнитуру Lanttich для рынка Казахстана</h1>
          <p>
            Мы работаем с мебельными производствами, магазинами фурнитуры и
            частными мастерами. В центре каталога не декоративная витрина, а
            удобный инструмент подбора и заказа.
          </p>
          <Link to="/catalog" className="about-btn">
            Смотреть каталог
          </Link>
        </div>

        <div className="about-hero__image">
          <img
            src="/catalog-assets/generated/opening-systems.png"
            alt="Фурнитура Lanttich"
          />
        </div>
      </div>

      <div className="about-metrics">
        <div>
          <strong>10+</strong>
          <span>лет работы с мебельной фурнитурой и комплектующими</span>
        </div>
        <div>
          <strong>100+</strong>
          <span>позиций и технических параметров в каталоге</span>
        </div>
        <div>
          <strong>KZ</strong>
          <span>отгрузка по Алматы и регионам Казахстана</span>
        </div>
      </div>

      <section className="about-section">
        <div className="about-section__head">
          <div className="about-kicker">Подход</div>
          <h2>Каталог рассчитан на реальную закупку</h2>
        </div>

        <div className="about-principles">
          {principles.map((item) => (
            <article className="about-principle" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-split">
        <div className="about-assortment">
          <div className="about-kicker">Ассортимент</div>
          <h2>Основные группы Lanttich</h2>
          <div className="about-tag-list">
            {assortment.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="about-photo-panel">
          <img
            src="/catalog-assets/generated/bottle-holders.png"
            alt="Системы хранения Lanttich"
          />
        </div>
      </section>

      <section className="about-system">
        <div className="about-system__content">
          <div className="about-kicker">Сервис</div>
          <h2>Позиции удобно сверять, согласовывать и отправлять в работу</h2>
          <p>
            Если нужен счет, подбор аналога или уточнение по отгрузке, менеджер
            быстро продолжает работу с уже собранным списком позиций.
          </p>
          <Link to="/contacts" className="about-btn about-btn--ghost">
            Связаться с менеджером
          </Link>
        </div>

        <div className="about-system__grid">
          {serviceItems.map((item, index) => (
            <div className="about-system__item" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
