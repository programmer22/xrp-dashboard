use leptos::*;

#[component]
fn Header() -> impl IntoView {
    view! {
        <header class=" text-xs flex items-center justify-between border-2 border-red-200 p-4">
            <p class="text-xl">{"DashboardX"}</p>
            <div>
                <input type="text" placeholder="Search Profiles..." class="border-2 border-red-200 px-4 py-2 rounded-full" />
                <img src="./search.png" class="" />
            </div>
            <div>
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    {"Login"}
                </button>
                <button class="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    {"Sign Up"}
                </button>
            </div>
        </header>
    }
}

#[component]
fn App() -> impl IntoView {
    let (greeting, set_greeting) = create_signal(String::new());

    let fetch_greeting = move |_| {
        let set_greeting = set_greeting.clone();
        spawn_local(async move {
            if let Ok(response) = reqwest::get("http://127.0.0.1:8000").await {
                if let Ok(text) = response.text().await {
                    set_greeting(text);
                }
            }
        });
    };

    view! {
        <Header />
        <button class="border-2 border-red-200 px-4 py-2" on:click=fetch_greeting>
            "Fetch Greeting"
        </button>
        <p>
            {greeting.get().clone()}
        </p>
    }
}

fn main() {
    mount_to_body(|| view! { <App /> });
}

