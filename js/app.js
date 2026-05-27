document.addEventListener("DOMContentLoaded", () => {
    const contentor = document.getElementById("view-content");
    const links = document.querySelectorAll(".nav-link, .nav-logo");
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    const alternarMenu = () => {
        menuToggle.classList.toggle("open");
        navLinks.classList.toggle("open");
        
        // Bloqueia o scroll do fundo da paróquia enquanto o menu está aberto
        document.body.style.overflow = navLinks.classList.contains("open") ? "hidden" : "";
    };

    menuToggle.addEventListener("click", alternarMenu);

    // [Ajuste no teu intercetor de cliques de links existente]
    document.addEventListener("click", (e) => {
        const alvo = e.target.closest(".nav-link, .nav-logo");
        if (alvo) {
            e.preventDefault();
            const rota = alvo.getAttribute("href");
            
            // SE O MENU ESTIVER ABERTO (no telemóvel), FECHA-O antes de mudar de página
            if (navLinks.classList.contains("open")) {
                alternarMenu();
            }
            
            history.pushState({ rota }, "", rota);
            carregarComponente(rota);
        }
    });

    // Função para carregar o layout PHP
    const carregarLayout = async (rota) => {
        // Se a rota for vazia ou 'home', aponta para o home.php
        const view = (rota === "" || rota === "home") ? "home" : rota;
        
        try {
            contentor.style.opacity = 0; // Efeito simples de fade-out
            
            const resposta = await fetch(`layouts/${view}.html`);
            if (!resposta.ok) throw new Error("Layout não encontrado");
            
            const html = await resposta.text();
            
            setTimeout(() => {
                contentor.innerHTML = html;
                contentor.style.opacity = 1; // Fade-in
                atualizarLinksAtivos(view);
                if (view === "home") {
        carregarInstagramFeed();
    } if (view === "dizimista") {
        carregarFormularioDizimo();
    }
            }, 150);

        } catch (erro) {
            contentor.innerHTML = `<h2>Erro 404</h2><p>A página que procura não existe.</p>`;
            contentor.style.opacity = 1;
        }
    };

    // Atualiza a classe 'active' na navbar
    const atualizarLinksAtivos = (rota) => {
        links.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === rota) {
                link.classList.add("active");
            }
        });
    };

    // Intercetar os cliques nos links
    document.addEventListener("click", (e) => {
        const alvo = e.target.closest(".nav-link, .nav-logo");
        if (alvo) {
            e.preventDefault();
            const rota = alvo.getAttribute("href");
            
            // Atualiza o URL do browser sem recarregar a página
            history.pushState({ rota }, "", rota);
            carregarLayout(rota);
        }
    });

    // Escutar quando o utilizador usa as setas do Browser (Voltar/Avançar)
    window.addEventListener("popstate", (e) => {
        const rota = e.state ? e.state.rota : "home";
        carregarLayout(rota);
    });

    // Carregar a rota inicial (com base no URL atual)
    const rotaInicial = window.location.pathname.split("/").pop();
    carregarLayout(rotaInicial);
});

const INSTAGRAM_ACCESS_TOKEN = "TEU_TOKEN_DE_ACESSO_AQUI"; 

const carregarInstagramFeed = async () => {
    const feedContainer = document.getElementById("insta-feed");
    if (!feedContainer) return; // Se não estiver na Home, interrompe a função

    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink&limit=6&access_token=${INSTAGRAM_ACCESS_TOKEN}`;

    try {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error("Erro ao carregar o feed do Instagram");
        
        const dados = await resposta.json();
        
        // Limpar o texto de "A carregar..."
        feedContainer.innerHTML = "";

        // Filtrar e renderizar apenas imagens ou vídeos (ignora posts sem imagem se houver)
        dados.data.forEach(post => {
            if (post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM" || post.media_type === "VIDEO") {
                
                // Tratar caso o post não tenha legenda
                const legenda = post.caption ? post.caption : "Ver publicação no Instagram";
                
                // Se for um vídeo, podemos usar a miniatura (thumbnail) ou a própria media_url
                const mediaUrl = post.media_url;

                const cardHTML = `
                    <div class="insta-card">
                        <img src="${mediaUrl}" alt="Publicação da Paróquia" loading="lazy">
                        <a href="${post.permalink}" target="_blank" rel="noopener noreferrer" class="insta-overlay">
                            <p>${legenda}</p>
                        </a>
                    </div>
                `;
                feedContainer.insertAdjacentHTML("beforeend", cardHTML);
            }
        });

    } catch (erro) {
        console.error(erro);
        feedContainer.innerHTML = `<div class="loading-insta">Não foi possível carregar os avisos do Instagram neste momento. Visite a nossa página oficial.</div>`;
    }
};

const configurarFormularioDizimo = () => {
    const formulario = document.getElementById("form-dizimista");
    const container = document.getElementById("dizimo-container");
    const botao = document.getElementById("btn-submeter-dizimo");

    if (!formulario || !container) return;

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault(); // Impede o redirecionamento da página para o Formspree

        // Feedback visual de que está a enviar
        botao.disabled = true;
        botao.innerText = "A enviar...";

        const dados = new FormData(formulario);

        try {
            const resposta = await fetch(formulario.action, {
                method: formulario.method,
                body: dados,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (resposta.ok) {
                // Animação suave de troca de conteúdo
                container.style.opacity = 0;
                
                setTimeout(() => {
                    // HTML da mensagem de agradecimento personalizada e elegante
                    container.innerHTML = `
                        <div class="agradecimento-box" style="text-align: center; padding: 3rem 2rem; border: 1px solid #eae5da; background: #fff; border-radius: 4px;">
                            <span style="font-size: 3rem; color: var(--accent-color); display: block; margin-bottom: 1rem;">✝</span>
                            <h3 style="font-family: var(--font-title); color: var(--text-color); margin-bottom: 1rem; font-size: 1.4rem;">Deus lhe pague!</h3>
                            <p style="color: #555; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">
                                Agradecemos generosamente a sua inscrição como dizimista. A sua corresponsabilidade ajuda a manter viva a nossa comunidade e as nossas obras de evangelização e caridade.
                            </p>
                            <p style="font-size: 0.85rem; color: #777; font-style: italic;">A secretaria paroquial entrará em contacto brevemente.</p>
                        </div>
                    `;
                    container.style.opacity = 1;
                }, 200);

            } else {
                throw new Error("Erro no servidor");
            }

        } catch (erro) {
            botao.disabled = false;
            botao.innerText = "Submeter Inscrição";
            alert("Ocorreu um erro ao enviar a sua inscrição. Por favor, tente novamente ou contacte a secretaria.");
        }
    });
};