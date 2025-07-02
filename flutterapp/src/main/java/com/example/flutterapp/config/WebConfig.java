package com.example.flutterapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    String[] urls = {
            "http://localhost:3000",
            "https://wedding-platform-zeta.vercel.app",
            "https://master.d23l4mo9odzywu.amplifyapp.com/",
            "https://www.weddesigner.io"
    };

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(urls) // or your frontend URL
                .allowedMethods("*");
    }
}
