(() => {
  "use strict";
  // Navegacao e componentes

  const data = window.ACHOU_DATA;
  const $ = window.jQuery;
  const slides = [...document.querySelectorAll(".presentation-section")];
  const navItems = [...document.querySelectorAll(".nav-item")];
  const progress = document.querySelector(".nav-progress i");
  const progressLabels = document.querySelectorAll(".nav-progress span");
  const controlButtons = document.querySelectorAll(".presentation-controls button");
  let activeSection = 0;
  let activePhase = 0;
  let activeTopic = 0;
  let activeDetailPage = 0;
  let detailsPerPage = 3;
  let enabledDimensions = ["ods", "direitos", "extensao", "inter"];
  let selectedDimension = null;

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);

  const icon = (name, size = 20) => {
    const paths = {
      arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      spark: '<path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>',
      target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
      layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5m-18 4 9 5 9-5"/>',
    };
    return `<svg aria-hidden="true" fill="none" width="${size}" height="${size}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.arrow}</svg>`;
  };

  // Navegacao
  function changeSection(index) {
    activeSection = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, position) => {
      const active = position === activeSection;
      slide.classList.toggle("active-slide", active);
      if (active && $) $(slide).stop(true, true).hide().fadeIn(220);
    });
    navItems.forEach((item, position) => {
      item.classList.toggle("active", position === activeSection);
      if (position === activeSection) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    progress.style.width = `${((activeSection + 1) / slides.length) * 100}%`;
    progressLabels[0].textContent = String(activeSection + 1).padStart(2, "0");
    controlButtons[0].disabled = activeSection === 0;
    controlButtons[1].disabled = activeSection === slides.length - 1;
    document.querySelector(".presentation-controls > span").textContent = data.sections[activeSection].label;
  }

  // Fases
  function renderPhase() {
    const phase = data.phases[activePhase];
    const detail = document.querySelector(".phase-detail");
    const phaseTabs = document.querySelectorAll(".phase-tab");
    phaseTabs.forEach((tab, index) => {
      tab.classList.toggle("active", index === activePhase);
      tab.setAttribute("aria-selected", String(index === activePhase));
    });
    detail.className = `phase-detail phase-${activePhase + 1}`;
    const artifacts = activePhase === 0
      ? '<div class="phase-artifacts"><strong>Criação de artefatos:</strong><ul><li>Persona</li><li>Mapa de Empatia</li><li>Storyboard</li></ul></div>'
      : "";
    const metrics = activePhase === 1
      ? `<div class="phase-metrics"><div class="metric-header"><span class="status-badge realized">REALIZADO · FASE 2</span><div>Indicadores técnicos.</div></div><div class="metrics-grid">${data.achievedMetrics.map(([value, label]) => `<div class="metric-card"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join("")}</div></div>`
      : "";
    detail.innerHTML = `<div class="phase-number">${phase.number}</div><div class="phase-copy"><span class="eyebrow">${escapeHtml(phase.eyebrow)}</span><div class="phase-title">${escapeHtml(phase.title)}</div>${activePhase === 2 ? `<div class="current-banner">${icon("spark", 17)} ETAPA ATUAL</div>` : ""}<div class="phase-list">${phase.items.map((item) => `<div>${icon("check", 16)} ${escapeHtml(item)}</div>`).join("")}</div>${artifacts}</div><div class="phase-result"><span>Resultado</span><strong>${escapeHtml(phase.result)}</strong>${icon(activePhase === 2 ? "target" : "layers", 34)}</div>${metrics}`;
  }

  // Plano
  function topicNumber(index) {
    if (index < 6) return String(index + 1).padStart(2, "0");
    return index === 6 ? "06.1" : String(index).padStart(2, "0");
  }

  function renderTopic() {
    const plan = data.planTopics[activeTopic];
    const detailCount = activeTopic === 6 ? 1 : Math.ceil(plan.details.length / detailsPerPage);
    const visibleDetails = activeTopic === 6
      ? plan.details
      : plan.details.slice(activeDetailPage * detailsPerPage, (activeDetailPage + 1) * detailsPerPage);
    document.querySelectorAll(".topic-button").forEach((button, index) => {
      button.classList.toggle("active", index === activeTopic);
      button.setAttribute("aria-selected", String(index === activeTopic));
    });
    const picker = document.querySelector(".mobile-topic-picker select");
    if (picker) picker.value = String(activeTopic);
    const detail = document.querySelector(".topic-detail");
    detail.setAttribute("aria-labelledby", `topic-tab-${activeTopic}`);
    detail.classList.remove("topic-reveal");
    const cards = visibleDetails.map((item) => `<div class="topic-detail-card"><strong>${escapeHtml(item.heading)}</strong><ul>${item.items.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul></div>`).join("");
    const value = activeTopic === 0 ? `<div class="core-value">${icon("target", 22)}<div><strong>Valor inegociável do projeto</strong><span>Respeito às práticas comerciais já adotadas, sem interferência na dinâmica dos negócios e com previsibilidade de custos operacionais e contratuais.</span></div></div>` : "";
    const controls = detailCount > 1
      ? `<div class="detail-carousel-status">${Array.from({ length: detailCount }, (_, index) => `<button type="button" class="${activeDetailPage === index ? "active" : ""}" data-detail-page="${index}" aria-label="Exibir grupo ${index + 1} de ${detailCount}"></button>`).join("")}</div>`
      : "";
    detail.innerHTML = `<div class="topic-counter">${topicNumber(activeTopic)} / 08</div><div class="topic-title">${escapeHtml(plan.title)}</div>${plan.intro ? `<div class="topic-intro">${escapeHtml(plan.intro)}</div>` : ""}${value}<div class="detail-carousel${activeTopic === 6 ? " swot-carousel" : ""}"><button type="button" class="detail-carousel-arrow previous" aria-label="Blocos anteriores" ${activeDetailPage === 0 ? "disabled" : ""}>${icon("arrow")}</button><div class="topic-detail-grid">${cards}</div><button type="button" class="detail-carousel-arrow next" aria-label="Próximos blocos" ${activeDetailPage === detailCount - 1 ? "disabled" : ""}>${icon("arrow")}</button>${controls}</div>`;
    detail.classList.add("topic-reveal");
  }

  // Dimensoes
  const evidence = {
    ods: '<ul class="ods-list"><li><span class="ods-symbol ods-8"><b>8</b></span><span><strong>ODS 8</strong>Trabalho Decente e Crescimento Econômico</span></li><li><span class="ods-symbol ods-9"><b>9</b></span><span><strong>ODS 9</strong>Indústria, Inovação e Infraestrutura</span></li><li><span class="ods-symbol ods-10"><b>10</b></span><span><strong>ODS 10</strong>Redução das Desigualdades</span></li><li><span class="ods-symbol ods-11"><b>11</b></span><span><strong>ODS 11 — Cidades Sustentáveis</strong>Estímulo à economia hiperlocal e à mobilidade ativa pelo conceito de cidades de proximidade.<cite>MORENO, Carlos. Droit de Cité: De la «ville-monde» à la «ville du quart d’heure». Paris: L’Observatoire, 2020.</cite></span></li></ul>',
    direitos: '<ol class="human-rights-list"><li><strong>1. Inclusão e Acessibilidade Digital (Art. 19 e 26 da DUDH / ODS 9 da ONU)</strong><p><b>Princípio:</b> Acesso à tecnologia e informação como extensão dos direitos à educação, comunicação e cidadania.</p></li><li><strong>2. Trabalho Decente e Justiça Econômica (Art. 23 da DUDH)</strong><p><b>Princípio:</b> Direito a condições de trabalho equitativas, justa remuneração e livre escolha de emprego.</p></li><li><strong>3. Autodeterminação Econômica (Art. 1º do PIDESC / Arts. 1º e 22 da DUDH)</strong><p><b>Princípio:</b> Respeito ao protagonismo, autonomia e livre desenvolvimento econômico sobre a própria subsistência (ONU).</p></li></ol>',
    extensao: '<ul class="extension-evidence"><li><strong>Fase 1:</strong> Levantamento de requisitos, pesquisa comunitária e submissão do protótipo preliminar no IV WIPEX para coleta de feedbacks.</li><li><strong>Fase 2:</strong> Estruturação do backlog via histórias de usuário, testes de aceitação (UAT) com usuários finais e entrega do MVP multiplataforma (Web/Android).</li><li><strong>Fase 3:</strong> Modelagem do plano de negócios, validação prática da solução junto ao APL local e divulgação dos resultados conclusivos no V WIPEX.</li></ul>',
  };

  // Selecao da teia
  function selectWebItem(title, detail, dimension) {
    selectedDimension = dimension || null;
    const inspector = document.querySelector(".web-inspector");
    const description = dimension === "direitos"
      ? "Inclusão digital, trabalho decente e autodeterminação econômica como dimensões de direitos humanos."
      : dimension === "ods"
        ? "Trabalho e renda local, infraestrutura tecnológica inclusiva, redução das desigualdades e cidades sustentáveis."
        : dimension === "extensao"
          ? "Diagnóstico e validação aproximam o projeto de microempreendedores, moradores e organizações de Pinhais."
          : dimension === "inter"
            ? "As contribuições disciplinares fundamentam-se na visão sistêmica exigida pelo projeto, conectando de forma interdisciplinar os saberes do curso."
            : detail;
    inspector.querySelector(".inspector-icon").innerHTML = icon("layers", 30);
    inspector.querySelector(".web-inspector > strong").textContent = title;
    inspector.querySelectorAll(":scope > p, :scope > .ods-list, :scope > .human-rights-list, :scope > .extension-evidence, :scope > .web-inspector-content").forEach((item) => item.remove());
    const content = document.createElement("div");
    content.className = "web-inspector-content";
    if (evidence[dimension]) content.innerHTML = evidence[dimension];
    else content.innerHTML = `<p class="inspector-description">${escapeHtml(description)}</p>`;
    inspector.append(content);
    if ($) $(content).hide().slideDown(180);
  }

  // Renderizacao da teia
  function renderWeb() {
    const canvas = document.querySelector(".web-canvas");
    const relations = data.relations.filter((relation) =>
      enabledDimensions.includes(relation.from) && (relation.to === "center" || enabledDimensions.includes(relation.to)),
    );
    const lineMarkup = relations.map((relation) => {
      const start = data.dimensions[relation.from];
      const end = relation.to === "center" ? { x: 300, y: 250 } : data.dimensions[relation.to];
      return `<g class="web-relation" role="button" tabindex="0" data-title="${escapeHtml(relation.label)}" data-detail="${escapeHtml(relation.detail)}"><line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="${start.color}"/><circle cx="${(start.x + end.x) / 2}" cy="${(start.y + end.y) / 2}" r="6" fill="${start.color}"/></g>`;
    }).join("");
    const nodes = Object.entries(data.dimensions).filter(([key]) => enabledDimensions.includes(key)).map(([key, dimension]) => `<g class="web-node" role="button" tabindex="0" data-dimension="${key}"><circle cx="${dimension.x}" cy="${dimension.y}" r="62" fill="${dimension.color}" filter="url(#glow)"/>${dimension.lines.map((line, index) => `<text x="${dimension.x}" y="${dimension.y + (index - (dimension.lines.length - 1) / 2) * 18 + 4}">${escapeHtml(line)}</text>`).join("")}</g>`).join("");
    canvas.querySelector("svg").innerHTML = `<defs><filter id="glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="300" cy="250" r="178" class="web-guide"/><circle cx="300" cy="250" r="98" class="web-guide inner"/>${lineMarkup}<g class="center-node" role="button" tabindex="0" data-center="true"><circle cx="300" cy="250" r="61"/><circle cx="300" cy="250" r="50"/><text x="300" y="245">ACHOU!</text><text x="300" y="268" class="center-subtitle">ECONOMIA LOCAL</text></g>${nodes}`;
  }

  // Fallback da logo
  document.querySelectorAll("img.brand-logo").forEach((image) => {
    image.addEventListener("error", () => {
      image.src = "public/achou-logo.png";
    }, { once: true });
  });

  // Eventos de navegacao
  navItems.forEach((item, index) => item.addEventListener("click", () => changeSection(index)));
  document.querySelectorAll(".brand").forEach((brand) => brand.addEventListener("click", () => changeSection(0)));
  document.querySelector(".primary-action").addEventListener("click", () => changeSection(1));
  controlButtons[0].addEventListener("click", () => changeSection(activeSection - 1));
  controlButtons[1].addEventListener("click", () => changeSection(activeSection + 1));

  document.addEventListener("keydown", (event) => {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
    if (["ArrowRight", "PageDown"].includes(event.key)) changeSection(activeSection + 1);
    if (["ArrowLeft", "PageUp"].includes(event.key)) changeSection(activeSection - 1);
    if (["Enter", " "].includes(event.key) && event.target.matches(".web-node, .web-relation, .center-node")) {
      event.preventDefault();
      event.target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
  });

  // Selecao de fase
  document.querySelectorAll(".phase-tab").forEach((tab, index) => tab.addEventListener("click", () => {
    activePhase = index;
    renderPhase();
  }));

  document.querySelectorAll(".topic-button").forEach((button, index) => {
    button.id = `topic-tab-${index}`;
    button.addEventListener("click", () => {
      activeTopic = index;
      activeDetailPage = 0;
      renderTopic();
    });
  });
  document.querySelector(".mobile-topic-picker select").addEventListener("change", (event) => {
    activeTopic = Number(event.target.value);
    activeDetailPage = 0;
    renderTopic();
  });
  document.querySelector(".topic-detail").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const count = activeTopic === 6 ? 1 : Math.ceil(data.planTopics[activeTopic].details.length / detailsPerPage);
    if (button.matches(".previous")) activeDetailPage = Math.max(0, activeDetailPage - 1);
    else if (button.matches(".next")) activeDetailPage = Math.min(count - 1, activeDetailPage + 1);
    else if (button.hasAttribute("data-detail-page")) activeDetailPage = Number(button.dataset.detailPage);
    renderTopic();
  });

  // Filtros desktop
  document.querySelectorAll(".dimension-toggle").forEach((button, index) => {
    const key = Object.keys(data.dimensions)[index];
    button.addEventListener("click", () => {
      if (enabledDimensions.includes(key) && selectedDimension === key) {
        selectWebItem(
          "ACHOU!",
          "Ative, desative ou selecione os nós e conexões para explorar os pontos de convergências acadêmicas e sociais do projeto.",
        );
      }
      enabledDimensions = enabledDimensions.includes(key)
        ? enabledDimensions.filter((dimension) => dimension !== key)
        : [...enabledDimensions, key];
      button.classList.toggle("active", enabledDimensions.includes(key));
      button.querySelector("strong").textContent = enabledDimensions.includes(key) ? "VISÍVEL" : "OCULTO";
      renderWeb();
    });
  });
  // Filtros mobile
  document.querySelectorAll(".mobile-web-option").forEach((button, index) => {
    const key = Object.keys(data.dimensions)[index];
    button.addEventListener("click", () => {
      const dimension = data.dimensions[key];
      button.classList.add("active");
      document.querySelectorAll(".mobile-web-option").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      selectWebItem(dimension.title, dimension.detail, key);
    });
  });
  // Interacao com a teia
  document.querySelector(".web-canvas").addEventListener("click", (event) => {
    const node = event.target.closest(".web-node, .center-node, .web-relation");
    if (!node) return;
    if (node.matches(".web-node")) {
      const dimension = data.dimensions[node.dataset.dimension];
      selectWebItem(dimension.title, dimension.detail, node.dataset.dimension);
    } else if (node.matches(".web-relation")) {
      selectWebItem(node.dataset.title, node.dataset.detail);
    } else {
      selectWebItem("ACHOU! — núcleo do ecossistema", "A plataforma articula tecnologia, gestão, extensão e impacto territorial em uma solução georreferenciada.");
    }
  });
  // Links externos
  document.querySelectorAll(".link-placeholders > button").forEach((button, index) => {
    const urls = [
      "https://github.com/YeddaMC/ACHOU_Projeto_Interdisciplinar_GTI_IFPR-",
      "https://achou--web.pages.dev/",
    ];
    button.addEventListener("click", () => window.open(urls[index], "_blank", "noopener,noreferrer"));
  });

  // Ajuste responsivo
  function updatePageSize() {
    detailsPerPage = window.innerWidth <= 760 ? 1 : window.innerWidth <= 1179 ? 2 : 3;
    activeDetailPage = 0;
    renderTopic();
  }
  window.addEventListener("resize", updatePageSize);

  // Inicializacao
  renderPhase();
  renderTopic();
  renderWeb();
  changeSection(0);
  updatePageSize();
})();