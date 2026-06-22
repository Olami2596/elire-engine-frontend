(function () {
  "use strict";

  const form = document.getElementById("lead-form");
  const submitBtn = document.getElementById("submit-btn");
  const statusEl = document.getElementById("form-status");

  const fields = ["first_name", "last_name", "email", "company_name", "job_title", "notes"];

  function setFieldError(fieldName, message) {
    const input = document.getElementById(fieldName);
    const errorEl = document.getElementById("error-" + fieldName);
    if (message) {
      input.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
    } else {
      input.removeAttribute("aria-invalid");
      errorEl.textContent = "";
    }
  }

  function clearAllErrors() {
    fields.forEach(function (name) {
      setFieldError(name, "");
    });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateForm(data) {
    let isValid = true;

    fields.forEach(function (name) {
      const value = (data[name] || "").trim();

      if (!value) {
        setFieldError(name, "This field is required.");
        isValid = false;
        return;
      }

      if (name === "email" && !isValidEmail(value)) {
        setFieldError(name, "Enter a valid email address.");
        isValid = false;
        return;
      }

      setFieldError(name, "");
    });

    return isValid;
  }

  function setStatus(message, tone) {
    statusEl.textContent = message;
    if (tone) {
      statusEl.setAttribute("data-tone", tone);
    } else {
      statusEl.removeAttribute("data-tone");
    }
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitBtn.setAttribute("data-loading", "true");
    } else {
      submitBtn.removeAttribute("data-loading");
    }
  }

  // Maps FastAPI's 422 Pydantic error shape back onto thematching input fields, e.g. loc: ["body", "email"] -> #email
  function applyServerValidationErrors(detail) {
    if (!Array.isArray(detail)) return;

    detail.forEach(function (err) {
      const loc = err.loc || [];
      const fieldName = loc[loc.length - 1];
      if (fields.includes(fieldName)) {
        setFieldError(fieldName, err.msg || "Invalid value.");
      }
    });
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearAllErrors();
    setStatus("", null);

    const data = {
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      email: form.email.value.trim(),
      company_name: form.company_name.value.trim(),
      job_title: form.job_title.value.trim(),
      notes: form.notes.value.trim()
    };

    if (!validateForm(data)) {
      setStatus("Check the highlighted fields and try again.", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(ELIRE_CONFIG.WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.status === 202) {
        setStatus("Thanks — your inquiry is on its way to the right team.", "success");
        form.reset();
        return;
      }

      if (response.status === 429 || response.status === 400) {
        setStatus("This email was already submitted in the last few minutes. We've got it.", "warning");
        return;
      }

      if (response.status === 422) {
        const body = await response.json();
        applyServerValidationErrors(body.detail);
        setStatus("Some fields need attention before we can submit this.", "error");
        return;
      }

      setStatus("Something went wrong on our end. Please try again shortly.", "error");

    } catch (networkError) {
      setStatus("Couldn't reach the server. Check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  });
})();
