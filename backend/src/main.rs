// Importing necessary modules from actix_cors and actix_web
use actix_cors::Cors;
use actix_web::{web, App, HttpServer, Responder};

// Asynchronous function that serves as a request handler
async fn greet() -> impl Responder {
    // Returns a simple greeting message as a response
    "Hello from Actix backend!"
}

// Entry point for the Actix web server
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Creating a new HTTP server
    HttpServer::new(|| {
        // Configuring Cross-Origin Resource Sharing (CORS)
        let cors = Cors::permissive()
            .allowed_origin("http://127.0.0.1:8080") // Allow frontend URL
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"]) // Specify allowed HTTP methods
            .allowed_headers(vec![
                actix_web::http::header::AUTHORIZATION, // Allow 'Authorization' header
                actix_web::http::header::ACCEPT,        // Allow 'Accept' header
                actix_web::http::header::CONTENT_TYPE,  // Allow 'Content-Type' header
            ])
            .max_age(3600); // Set maximum cache age for preflight requests

        // Configuring the Actix web application
        App::new()
            .wrap(cors) // Apply CORS middleware
            .route("/", web::get().to(greet)) // Define a route that handles GET requests at the root URL
    })
    .bind("127.0.0.1:8000")? // Bind the server to listen on this address and port
    .run() // Start the server
    .await // Await the server's future
}


