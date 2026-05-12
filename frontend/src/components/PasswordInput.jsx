import { useState } from "react";
import "./PasswordInput.css";

function EyeIcon({ hidden = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.75 12C4.35 7.85 7.55 5.75 12 5.75C16.45 5.75 19.65 7.85 21.25 12C19.65 16.15 16.45 18.25 12 18.25C7.55 18.25 4.35 16.15 2.75 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3.15" stroke="currentColor" strokeWidth="1.8" />
      {hidden && (
        <path
          d="M4.5 4.5L19.5 19.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.9"
        />
      )}
    </svg>
  );
}

export default function PasswordInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={name}>{label}</label>

      <div className="password-input">
        <input
          id={name}
          type={visible ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />

        <button
          type="button"
          className="password-input__toggle"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
          title={visible ? "Скрыть пароль" : "Показать пароль"}
        >
          <EyeIcon hidden={visible} />
        </button>
      </div>
    </div>
  );
}
