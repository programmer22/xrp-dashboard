use leptos::*;

#[component]
fn App() -> impl IntoView {
    let (count, set_count) = create_signal(0);

    view! {
        <button
            on:click=move |_| {
                // Update to increment the count by 1
                set_count.update(|n| *n += 1);
                
                // Set count directly to 3
                // set_count(3);

                // on stable, this is set_count.set(3);
                // set_count(3);
            }
        >
            // text nodes are wrapped in quotation marks
            "Click me: "
            {move || count.get()}

            // If using nightly Rust, you can optionally simplify to {count}
            // {move || count.get()}
        </button>
    }
}

fn main() {
    mount_to_body(|| view! { <App />})
}
