import { Link } from "react-router-dom";
import "./Contacts.css";

const requestItems = [
  "артикулы или фото нужной фурнитуры",
  "количество и формат упаковок",
  "город доставки",
  "нужен ли счёт или коммерческое предложение",
];

export default function Contacts() {
  return (
    <section className="contacts-page">
      <div className="contacts-hero">
        <div className="contacts-hero__content">
          <div className="contacts-kicker">Контакты</div>
          <h1>Свяжитесь с МФ Алматы для подбора и заказа фурнитуры</h1>
          <p>
            Подскажем по линейкам Lanttich, проверим наличие, поможем подобрать
            аналоги и подготовим заказ для производства, магазина или частного
            проекта.
          </p>

          <div className="contacts-actions">
            <a href="tel:+77774888854" className="contacts-btn">
              Позвонить
            </a>
            <a
              href="mailto:kazfurnitura-88@mail.ru"
              className="contacts-btn contacts-btn--ghost"
            >
              Написать на email
            </a>
          </div>
        </div>

        <div className="contacts-hero__image">
          <img
            src="/catalog-assets/generated/wardrobe-components.png"
            alt="Комплектующие Lanttich"
          />
        </div>
      </div>

      <div className="contacts-main">
        <div className="contacts-panel contacts-panel--primary">
          <div className="contacts-kicker">Основные контакты</div>

          <div className="contacts-row">
            <span>Телефон</span>
            <a href="tel:+77774888854">+7 777 488 88 54</a>
          </div>

          <div className="contacts-row">
            <span>Email</span>
            <a href="mailto:kazfurnitura-88@mail.ru">kazfurnitura-88@mail.ru</a>
          </div>

          <div className="contacts-row">
            <span>Адрес</span>
            <strong>г. Алматы, ул. Ратушного, 78А/1, оф.308</strong>
          </div>

          <div className="contacts-row">
            <span>Бренд</span>
            <strong>Lanttich</strong>
          </div>
        </div>

        <div className="contacts-panel">
          <div className="contacts-kicker">Что отправить менеджеру</div>
          <h2>Так заказ быстрее превратится в счёт</h2>

          <div className="contacts-request-list">
            {requestItems.map((item, index) => (
              <div className="contacts-request-item" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="contacts-delivery">
        <div className="contacts-delivery__head">
          <div className="contacts-kicker">Доставка</div>
          <h2>Поставки по Алматы и регионам Казахстана</h2>
          <p>
            Отгрузку можно согласовать под разовый заказ, регулярное снабжение
            мебельного цеха или комплектацию магазина фурнитуры.
          </p>
        </div>

        <div className="contacts-map-card">
          <img
            src="/catalog-assets/generated/kazakhstan-delivery-map.png"
            alt="Карта доставки по Казахстану"
            className="contacts-map-image"
          />
        </div>
      </section>

      <section className="contacts-bottom">
        <div>
          <div className="contacts-kicker">B2B</div>
          <h2>Нужны прайс, счёт или спецификация?</h2>
          <p>
            Перейдите в B2B-раздел или отправьте список позиций менеджеру.
            Подготовим документ по артикулам, упаковкам и условиям поставки.
          </p>
        </div>

        <Link to="/b2b" className="contacts-btn">
          B2B условия
        </Link>
      </section>
    </section>
  );
}
