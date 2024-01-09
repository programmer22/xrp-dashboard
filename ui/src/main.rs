use leptos::*;
use leptos_router::{use_query_map, Form};

#[component]
fn Header() -> impl IntoView {
    view! {
        <header class="text-xs flex items-center justify-between border-2 border-red-200 p-4">
            <p class="text-xl">{"DashboardX"}</p>
            <div class="flex items-center">
                <input type="text" placeholder="Search Profiles..." class="border-2 border-red-200 px-4 py-2 rounded-full" />
                <img src="./search.png" class="" />
            </div>
            <div>
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    {"Login"}
                </button>
                <button class="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    {"Register"}
                </button>
            </div>
        </header>
    }
}

#[component]
fn Body() -> impl IntoView {
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
        <div class="text-xs flex items-center justify-between border-2 border-red-200 p-4">
            <p>{"Body"}</p>
            <button class="border-2 border-red-200 px-4 py-2" on:click=fetch_greeting>
                "Fetch Greeting"
            </button>
            <p>
                {greeting.get().clone()}
            </p>
            <FormExample />
        </div>
    }
}

#[component]
fn Footer() -> impl IntoView {
    view! { 
        <footer class="text-xs flex items-center justify-between border-2 border-red-200 p-4">
            <p>{"Footer"}</p>
        </footer>
    }
}   

#[component]
pub fn FormExample() -> impl IntoView {
    view! {
        <div class="max-w-lg mx-auto my-8">
            <h2 class="text-xl font-semibold mb-4">Manual Submission</h2>
            <form class="space-y-4 text-xs">
                <div>
                    <label>First Name</label>
                    <input type="text" name="name" value="YourName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"/>
                </div>
                <input type="number" name="number" value="123" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"/>
                <select name="select" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                    <option value="A" selected>A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                </select>
                <input type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer"/>
            </form>
        </div>
    }
}


#[component]
fn App() -> impl IntoView {
    view! {
        <div class="container mx-auto flex flex-col gap-4 my-2">
            <Header />
            <Body /> 
            <Footer />
        </div>
    }
}

fn main() {
    mount_to_body(|| view! { <App /> });
}

