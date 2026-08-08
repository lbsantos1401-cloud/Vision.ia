/* =====================================================
   SOLTEC CLOUD
   APP.JS — V1
   ===================================================== */


/* =====================================================
   ESTADO DA APLICAÇÃO
   ===================================================== */

const state = {

    user:
        JSON.parse(
            localStorage.getItem(
                "soltecUser"
            )
        ) || null,

    deviceId:
        localStorage.getItem(
            "soltecDeviceId"
        ) || "GS-000001",

    outage: false
};



/* =====================================================
   FUNÇÃO AUXILIAR
   ===================================================== */

const $ = (selector) =>
    document.querySelector(selector);



/* =====================================================
   TELAS
   ===================================================== */

const views = {

    login:
        $("#loginView"),

    register:
        $("#registerView"),

    dashboard:
        $("#dashboardView")
};



/* =====================================================
   TROCAR DE TELA
   ===================================================== */

function showView(name) {

    Object
        .values(views)
        .forEach(
            view =>
                view.classList.remove(
                    "active"
                )
        );


    views[name]
        .classList.add(
            "active"
        );
}



/* =====================================================
   MENSAGEM TEMPORÁRIA
   ===================================================== */

function showToast(message) {

    const toast =
        $("#toast");


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timer
    );


    showToast.timer =
        setTimeout(
            () =>
                toast.classList.remove(
                    "show"
                ),
            2800
        );
}



/* =====================================================
   ATUALIZAR INFORMAÇÕES DO USUÁRIO
   ===================================================== */

function updateUserUI() {

    const user =
        state.user || {

            name:
                "Usuário",

            email:
                "—"
        };


    const firstName =
        user.name
            .split(" ")[0];


    $("#welcomeName")
        .textContent =
        `Olá, ${firstName}.`;


    $("#settingsName")
        .textContent =
        user.name;


    $("#settingsNameValue")
        .textContent =
        user.name;


    $("#settingsEmailValue")
        .textContent =
        user.email;


    $("#settingsDeviceValue")
        .textContent =
        state.deviceId;


    $("#profileAvatar")
        .textContent =
        (
            user.name
                .trim()[0]
            || "S"
        ).toUpperCase();


    $("#deviceId")
        .textContent =
        state.deviceId;
}



/* =====================================================
   ESTADO DA REDE
   ===================================================== */

function setEnergyState(
    outage
) {

    state.outage =
        outage;


    const scene =
        $("#energyScene");


    const card =
        $("#statusCard");


    const icon =
        $("#statusIcon");


    const title =
        $("#statusTitle");


    const message =
        $("#statusMessage");


    const indicator =
        $("#lineIndicator");


    const update =
        $("#lastUpdate");


    scene.classList.toggle(
        "outage",
        outage
    );


    card.classList.toggle(
        "outage",
        outage
    );


    card.classList.toggle(
        "normal",
        !outage
    );



    /* ==========================
       FALTA DE ENERGIA
       ========================== */

    if (outage) {

        indicator.textContent =
            "×";


        icon.textContent =
            "!";


        title.textContent =
            "Falta de energia detectada";


        message.textContent =
            "O sistema está sendo alimentado pelas baterias.";


        update.textContent =
            "Agora";
    }



    /* ==========================
       ENERGIA NORMAL
       ========================== */

    else {

        indicator.textContent =
            "●";


        icon.textContent =
            "✓";


        title.textContent =
            "Energia normal";


        message.textContent =
            "A energia da concessionária está disponível.";


        update.textContent =
            "Agora";
    }
}



/* =====================================================
   CONFIGURAÇÕES
   ===================================================== */

function openSettings() {

    $("#settingsPanel")
        .classList.add(
            "open"
        );


    $("#settingsBackdrop")
        .classList.add(
            "open"
        );


    $("#settingsPanel")
        .setAttribute(
            "aria-hidden",
            "false"
        );
}



function closeSettings() {

    $("#settingsPanel")
        .classList.remove(
            "open"
        );


    $("#settingsBackdrop")
        .classList.remove(
            "open"
        );


    $("#settingsPanel")
        .setAttribute(
            "aria-hidden",
            "true"
        );
}



/* =====================================================
   IR PARA CADASTRO
   ===================================================== */

$("#goRegister")
    .addEventListener(
        "click",
        () =>
            showView(
                "register"
            )
    );



/* =====================================================
   VOLTAR PARA LOGIN
   ===================================================== */

$("#goLogin")
    .addEventListener(
        "click",
        () =>
            showView(
                "login"
            )
    );



/* =====================================================
   LOGIN
   ===================================================== */

$("#loginForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const email =
                $("#loginEmail")
                    .value
                    .trim();


            const pin =
                $("#loginPin")
                    .value
                    .trim();



            if (
                !/^\d{6}$/
                    .test(pin)
            ) {

                showToast(
                    "O PIN do protótipo deve ter 6 dígitos."
                );

                return;
            }



            state.user = {

                name:
                    localStorage.getItem(
                        "soltecName"
                    )
                    ||
                    "Usuário",

                email
            };



            localStorage.setItem(

                "soltecUser",

                JSON.stringify(
                    state.user
                )
            );



            updateUserUI();


            showView(
                "dashboard"
            );
        }
    );



/* =====================================================
   CADASTRO
   ===================================================== */

$("#registerForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                $("#registerName")
                    .value
                    .trim();


            const email =
                $("#registerEmail")
                    .value
                    .trim();


            const pin =
                $("#registerPin")
                    .value
                    .trim();


            const confirmPin =
                $("#registerPinConfirm")
                    .value
                    .trim();



            if (
                !name ||
                !email
            ) {

                showToast(
                    "Preencha nome e e-mail."
                );

                return;
            }



            if (
                !/^\d{6}$/
                    .test(pin)
            ) {

                showToast(
                    "O PIN deve possuir 6 dígitos."
                );

                return;
            }



            if (
                pin !==
                confirmPin
            ) {

                showToast(
                    "Os PINs não coincidem."
                );

                return;
            }



            /*
             * SOMENTE PROTÓTIPO
             *
             * Não usar localStorage
             * para credenciais em produção.
             */

            localStorage.setItem(
                "soltecName",
                name
            );


            localStorage.setItem(

                "soltecUser",

                JSON.stringify({

                    name,

                    email
                })
            );



            state.user = {

                name,

                email
            };



            updateUserUI();


            showView(
                "dashboard"
            );


            showToast(
                "Conta criada no protótipo."
            );
        }
    );



/* =====================================================
   ABRIR CONFIGURAÇÕES
   ===================================================== */

$("#settingsBtn")
    .addEventListener(
        "click",
        openSettings
    );



/* =====================================================
   FECHAR CONFIGURAÇÕES
   ===================================================== */

$("#closeSettings")
    .addEventListener(
        "click",
        closeSettings
    );


$("#settingsBackdrop")
    .addEventListener(
        "click",
        closeSettings
    );



/* =====================================================
   SIMULAÇÃO DE FALTA DE ENERGIA
   ===================================================== */

$("#togglePower")
    .addEventListener(
        "click",
        () => {

            setEnergyState(
                !state.outage
            );


            showToast(

                state.outage

                    ? "Simulação: falta de energia detectada."

                    : "Simulação: energia restabelecida."
            );
        }
    );



/* =====================================================
   TESTE DE PUSH
   ===================================================== */

$("#testPushBtn")
    .addEventListener(
        "click",
        async () => {


            /*
             * Verifica se o navegador
             * suporta Notification API.
             */

            if (
                !(
                    "Notification"
                    in window
                )
            ) {

                showToast(
                    "Este navegador não oferece notificações neste ambiente."
                );

                return;
            }



            /*
             * Solicita permissão.
             */

            if (
                Notification.permission
                ===
                "default"
            ) {

                const permission =
                    await
                    Notification
                        .requestPermission();


                if (
                    permission
                    !==
                    "granted"
                ) {

                    showToast(
                        "Permissão para notificações não concedida."
                    );

                    return;
                }
            }



            /*
             * Envia notificação
             * local do navegador.
             */

            if (
                Notification.permission
                ===
                "granted"
            ) {

                new Notification(
                    "SolTec Cloud",
                    {

                        body:
                            "Teste de Push: o sistema de notificações está funcionando.",

                        tag:
                            "soltec-test"
                    }
                );


                showToast(
                    "Notificação de teste enviada."
                );

            }

            else {

                showToast(
                    "Permissão para notificações não concedida."
                );
            }
        }
    );



/* =====================================================
   LOGOUT
   ===================================================== */

$("#logoutBtn")
    .addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "soltecUser"
            );


            closeSettings();


            showView(
                "login"
            );


            showToast(
                "Você saiu da conta."
            );
        }
    );



/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */

updateUserUI();


if (
    state.user
) {

    showView(
        "dashboard"
    );

}

else {

    showView(
        "login"
    );
}


setEnergyState(
    false
);
