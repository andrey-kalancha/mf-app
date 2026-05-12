import { Link } from "react-router-dom";
import "./B2B.css";

const workflow = [
  {
    title: "Подбор по задаче",
    text: "Менеджер помогает собрать петли, направляющие, газлифты, сушилки, бутылочницы и крепеж под конкретную мебельную серию.",
  },
  {
    title: "Коммерческое предложение",
    text: "По списку позиций готовится понятная спецификация: артикулы, упаковки, количество, наличие и условия поставки.",
  },
  {
    title: "Счет и документы",
    text: "Для постоянных клиентов доступны счета, закрывающие документы и согласование регулярных поставок.",
  },
  {
    title: "Доставка по Казахстану",
    text: "Заказы можно комплектовать под отгрузку по Алматы и регионам Казахстана через удобную транспортную схему.",
  },
];

const advantages = [
  "Персональные условия для мебельных производств",
  "Подбор аналогов и совместимых комплектующих",
  "Работа с упаковками, весом и техническими параметрами",
  "Резервирование складских позиций под заказ",
  "Подготовка прайс-листов и спецификаций",
  "Консультация по линейкам Standard, Maxima и Promax",
];

const documents = [
  "Счет на оплату",
  "Коммерческое предложение",
  "Спецификация заказа",
  "Договор поставки",
  "Прайс-лист для постоянных клиентов",
  "Закрывающие документы",
];

export default function B2B() {
  return (
    <section className="b2b-page">
      <div className="b2b-hero">
        <div className="b2b-hero__content">
          <div className="b2b-badge">B2B снабжение</div>
          <h1>Фурнитура Lanttich для мебельных производств и магазинов</h1>
          <p>
            Помогаем быстро собрать заказ по артикулам, техническим параметрам и
            задачам производства: от разовой комплектации до регулярного
            снабжения мебельного цеха.
          </p>

          <div className="b2b-actions">
            <Link to="/catalog" className="b2b-btn">
              Подобрать фурнитуру
            </Link>
            <Link to="/contacts" className="b2b-btn b2b-btn--secondary">
              Связаться с менеджером
            </Link>
          </div>
        </div>

        <div className="b2b-hero__panel">
          <span>Для постоянных клиентов</span>
          <strong>Прайсы, счета, спецификации и поставки по Казахстану</strong>
          <p>
            Каталог можно использовать как рабочий инструмент для подбора,
            согласования и повторного заказа мебельной фурнитуры.
          </p>
        </div>
      </div>

      <div className="b2b-section">
        <div className="b2b-section__head">
          <div className="b2b-badge">Процесс заказа</div>
          <h2>От заявки до отгрузки</h2>
          <p>
            Логика раздела соответствует требованиям отчета: клиент выбирает
            товары в каталоге, менеджер уточняет параметры, формирует документы
            и сопровождает заказ до выдачи или доставки.
          </p>
        </div>

        <div className="b2b-workflow">
          {workflow.map((item, index) => (
            <article className="b2b-workflow__card" key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="b2b-split">
        <div className="b2b-info-card">
          <div className="b2b-badge">Возможности</div>
          <h2>Что получает B2B-клиент</h2>
          <div className="b2b-list">
            {advantages.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="b2b-info-card">
          <div className="b2b-badge">Документы</div>
          <h2>Что можно подготовить</h2>
          <div className="b2b-list">
            {documents.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="b2b-note">
        <div>
          <span>Следующий уровень автоматизации</span>
          <h2>Интеграция с учетной системой</h2>
          <p>
            В отчете предусмотрен обмен с 1C: остатки, цены, статусы заказов и
            документы. Текущая версия сайта уже подготовлена по структуре
            каталога, а интеграцию можно добавить отдельным backend-модулем.
          </p>
        </div>
        <Link to="/contacts" className="b2b-btn">
          Обсудить поставку
        </Link>
      </div>
    </section>
  );
}
