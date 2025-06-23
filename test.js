#!/usr/bin/env node

/**
 * Archivo de pruebas simples para el detector de idiomas
 * Demuestra la funcionalidad con ejemplos reales
 */

const { LanguageDetector } = require('./detector.js');

class TestRunner {
    constructor() {
        this.detector = new LanguageDetector();
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    addTest(text, expectedLang, description) {
        this.tests.push({ text, expectedLang, description });
    }

    runTests() {
        console.log('🧪 Ejecutando pruebas del detector de idiomas...\n');

        this.tests.forEach((test, index) => {
            console.log(`📝 Test ${index + 1}: ${test.description}`);
            console.log(`   Texto: "${test.text}"`);
            
            const result = this.detector.detectLanguage(test.text);
            const success = result.language === test.expectedLang;
            
            if (success) {
                console.log(`    PASS - Detectado: ${result.language} (${result.confidence}%)`);
                this.passed++;
            } else {
                console.log(`    FAIL - Esperado: ${test.expectedLang}, Obtenido: ${result.language}`);
                this.failed++;
            }
            
            if (result.language === 'mixed') {
                console.log(`    Distribución: ES ${result.spanish}% / EN ${result.english}%`);
            }
            
            console.log('');
        });

        this.showSummary();
    }

    showSummary() {
        const total = this.passed + this.failed;
        const percentage = Math.round((this.passed / total) * 100);
        
        console.log(' RESUMEN DE PRUEBAS');
        console.log('='.repeat(50));
        console.log(`Total: ${total}`);
        console.log(`Pasadas: ${this.passed} ✅`);
        console.log(`Fallidas: ${this.failed} ${this.failed > 0 ? '❌' : ''}`);
        console.log(`Precisión: ${percentage}%`);
        
        if (percentage >= 80) {
            console.log(' ¡Excelente! El detector funciona bien.');
        } else if (percentage >= 60) {
            console.log('  Funcionamiento aceptable, pero se puede mejorar.');
        } else {
            console.log(' Necesita ajustes importantes.');
        }
    }
}

// Configurar las pruebas
const runner = new TestRunner();

// Pruebas de español claro

runner.addTest(
    "La programación es una habilidad muy importante en el mundo tecnológico actual.",
    "spanish",
    "Español con vocabulario técnico"
);

runner.addTest(
    "¿Cómo estás? Espero que tengas un buen día y que todo vaya bien en tu trabajo.",
    "spanish",
    "Español conversacional con pregunta"
);

// Pruebas de inglés claro
runner.addTest(
    "Hello, my name is Peter and I want to travel to Europe to learn about different cultures.",
    "english",
    "Inglés claro con contexto del ejercicio"
);

runner.addTest(
    "Programming is a very important skill in today's technological world.",
    "english",
    "Inglés con vocabulario técnico"
);

runner.addTest(
    "How are you? I hope you have a good day and everything goes well at work.",
    "english",
    "Inglés conversacional con pregunta"
);

// Pruebas de spanglish/mixto
runner.addTest(
    "Hi amigo, ¿how are you doing today? I hope todo está bien.",
    "mixed",
    "Spanglish típico con mezcla equilibrada"
);

runner.addTest(
    "Let's go al mercado to buy some groceries, ¿te parece bien?",
    "mixed",
    "Spanglish con cambio de idioma frecuente"
);

runner.addTest(
    "My trabajo is very demanding pero I love what I do cada día.",
    "mixed",
    "Spanglish profesional"
);



runner.addTest(
    "Hola",
    "undetermined",
    "Palabra muy corta"
);

runner.addTest(
    "The quick brown fox jumps over the lazy dog every morning.",
    "english",
    "Inglés con frase conocida"
);

runner.addTest(
    "El rápido zorro marrón salta sobre el perro perezoso cada mañana.",
    "spanish",
    "Español con traducción de frase conocida"
);

// Casos con acentos y ñ
runner.addTest(
    "La niña pequeña está comiendo una piña en la montaña.",
    "spanish",
    "Español con múltiples ñ y acentos"
);

runner.addTest(
    "Programación, configuración, investigación, documentación técnica.",
    "spanish",
    "Español con terminaciones -ción"
);

runner.addTest(
    "Programming, configuration, investigation, technical documentation.",
    "english",
    "Inglés con terminaciones -tion"
);

// Ejecutar todas las pruebas
if (require.main === module) {
    runner.runTests();
}

module.exports = TestRunner;