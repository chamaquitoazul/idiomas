
const fs = require('fs');
const readline = require('readline');

class LanguageDetector {
    constructor() {
        // Palabras más comunes en español (investigadas de corpus frecuentes)
        this.spanishStopWords = new Set([
            'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le',
            'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'pero',
            'sus', 'muy', 'ya', 'está', 'ser', 'son', 'como', 'más', 'este', 'esta', 'año',
            'todo', 'también', 'había', 'fue', 'han', 'hacer', 'puede', 'tiempo', 'está'
        ]);

        // Palabras más comunes en inglés
        this.englishStopWords = new Set([
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not',
            'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from',
            'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would',
            'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which'
        ]);

        // Bigramas comunes en español (secuencias de 2 caracteres)
        this.spanishBigrams = new Set([
            'es', 'en', 'de', 'la', 'el', 'ar', 'er', 'ir', 'ón', 'ía', 'ad', 'qu', 'll', 'rr'
        ]);

        // Bigramas comunes en inglés
        this.englishBigrams = new Set([
            'th', 'he', 'in', 'er', 'an', 'ed', 'nd', 'to', 'en', 'ti', 'te', 'or', 'st', 'ar'
        ]);

        // Terminaciones comunes en español
        this.spanishEndings = new Set([
            'ción', 'ando', 'endo', 'ado', 'ido', 'mente', 'dad', 'tad'
        ]);

        // Terminaciones comunes en inglés
        this.englishEndings = new Set([
            'tion', 'ing', 'ed', 'ly', 'ness', 'ful', 'less', 'ment'
        ]);
    }

    /**
     * Analiza caracteres específicos del español
     * La presencia de ñ y acentos es un fuerte indicador de español
     */
    analyzeSpanishCharacters(text) {
        const spanishChars = /[ñáéíóúü]/gi;
        const matches = text.match(spanishChars);
        return matches ? matches.length : 0;
    }

    /**
     * Cuenta palabras comunes de cada idioma
     * Las stop words son muy indicativas del idioma
     */
    analyzeStopWords(text) {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        let spanishCount = 0;
        let englishCount = 0;

        words.forEach(word => {
            if (this.spanishStopWords.has(word)) spanishCount++;
            if (this.englishStopWords.has(word)) englishCount++;
        });

        return { spanishCount, englishCount };
    }

    /**
     * Analiza bigramas (secuencias de 2 caracteres)
     * Cada idioma tiene patrones característicos
     */
    analyzeBigrams(text) {
        const cleanText = text.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
        let spanishScore = 0;
        let englishScore = 0;

        for (let i = 0; i < cleanText.length - 1; i++) {
            const bigram = cleanText.substring(i, i + 2);
            if (this.spanishBigrams.has(bigram)) spanishScore++;
            if (this.englishBigrams.has(bigram)) englishScore++;
        }

        return { spanishScore, englishScore };
    }

    /**
     * Analiza terminaciones de palabras
     * Sufijos típicos de cada idioma
     */
    analyzeWordEndings(text) {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        let spanishEndingCount = 0;
        let englishEndingCount = 0;

        words.forEach(word => {
            if (word.length > 3) {
                // Verificar terminaciones españolas
                this.spanishEndings.forEach(ending => {
                    if (word.endsWith(ending)) spanishEndingCount++;
                });

                // Verificar terminaciones inglesas
                this.englishEndings.forEach(ending => {
                    if (word.endsWith(ending)) englishEndingCount++;
                });
            }
        });

        return { spanishEndingCount, englishEndingCount };
    }

    /**
     * Función principal de detección
     * Combina todas las métricas para dar un resultado
     */
    detectLanguage(text) {
        if (!text || text.trim().length < 10) {
            return {
                language: 'undetermined',
                confidence: 0,
                spanish: 0,
                english: 0,
                reason: 'Texto demasiado corto para análisis'
            };
        }

        // Análisis de caracteres específicos del español
        const spanishChars = this.analyzeSpanishCharacters(text);

        // Análisis de palabras comunes
        const stopWords = this.analyzeStopWords(text);

        // Análisis de bigramas
        const bigrams = this.analyzeBigrams(text);

        // Análisis de terminaciones
        const endings = this.analyzeWordEndings(text);

        // Sistema de puntuación ponderado
        // Basado en la investigación: los caracteres especiales y stop words
        // son los indicadores más confiables
        let spanishScore = 0;
        let englishScore = 0;

        // Peso alto para caracteres específicos del español
        spanishScore += spanishChars * 3;

        // Peso alto para stop words (muy confiables)
        spanishScore += stopWords.spanishCount * 2;
        englishScore += stopWords.englishCount * 2;

        // Peso medio para bigramas
        spanishScore += bigrams.spanishScore * 1;
        englishScore += bigrams.englishScore * 1;

        // Peso bajo para terminaciones
        spanishScore += endings.spanishEndingCount * 0.5;
        englishScore += endings.englishEndingCount * 0.5;

        const totalScore = spanishScore + englishScore;
        
        if (totalScore === 0) {
            return {
                language: 'undetermined',
                confidence: 0,
                spanish: 0,
                english: 0,
                reason: 'No se encontraron patrones reconocibles'
            };
        }

        const spanishPercentage = (spanishScore / totalScore) * 100;
        const englishPercentage = (englishScore / totalScore) * 100;

        // Lógica de decisión
        let language, confidence;
        
        if (spanishPercentage > 70) {
            language = 'spanish';
            confidence = spanishPercentage;
        } else if (englishPercentage > 70) {
            language = 'english';
            confidence = englishPercentage;
        } else {
            language = 'mixed'; // Spanglish u otro
            confidence = Math.abs(spanishPercentage - englishPercentage);
        }

        return {
            language,
            confidence: Math.round(confidence),
            spanish: Math.round(spanishPercentage),
            english: Math.round(englishPercentage),
            details: {
                spanishChars,
                stopWords,
                bigrams,
                endings
            }
        };
    }
}

// CLI Interface
class LanguageDetectorCLI {
    constructor() {
        this.detector = new LanguageDetector();
    }

    async processFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return this.detector.detectLanguage(content);
        } catch (error) {
            console.error(`Error leyendo archivo ${filePath}:`, error.message);
            return null;
        }
    }

    async interactiveMode() {
        console.log('Detector de Idiomas - Modo Interactivo');
        console.log('Escribe texto para detectar si es español, inglés o mixto');
        console.log('Escribe "salir" para terminar\n');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askForText = () => {
            rl.question('Texto > ', (text) => {
                if (text.toLowerCase() === 'salir') {
                    rl.close();
                    return;
                }

                const result = this.detector.detectLanguage(text);
                this.displayResult(result);
                console.log(''); 
                askForText();
            });
        };

        askForText();
    }

    displayResult(result) {
        if (!result) return;

        console.log(' Resultado:');
        console.log(`  Idioma: ${this.getLanguageName(result.language)}`);
        console.log(`  Confianza: ${result.confidence}%`);
        if (result.language === 'mixed') {
            console.log(`   Español: ${result.spanish}%`);
            console.log(`   Inglés: ${result.english}%`);
            console.log('   💡 Parece ser una mezcla (¿Spanglish?)');
        }
        if (result.reason) {
            console.log(`   Razón: ${result.reason}`);
        }
    }

    getLanguageName(language) {
        const names = {
            'spanish': '🇪🇸 Español',
            'english': '🇺🇸 Inglés',
            'mixed': ' Mixto/Spanglish',
            'undetermined': ' Indeterminado'
        };
        return names[language] || language;
    }

    showHelp() {
        console.log(`
🌍 Detector de Idiomas 

USO:
  node detector.js                    - Modo interactivo
  node detector.js "texto aquí"       - Detectar texto directo
  node detector.js -f archivo.txt     - Analizar archivo

EJEMPLOS:
  node detector.js "Hello world"
  node detector.js "Hola mundo"
  node detector.js "Hi, ¿cómo estás?"
        `);
    }
}

// Punto de entrada principal
function main() {
    const cli = new LanguageDetectorCLI();
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // Modo interactivo
        cli.interactiveMode();
    } else if (args[0] === '-h' || args[0] === '--help') {
        cli.showHelp();
    } else if (args[0] === '-f' && args[1]) {
        // Modo archivo
        const result = cli.processFile(args[1]);
        if (result) {
            cli.displayResult(result);
        }
    } else {
        // Texto directo
        const text = args.join(' ');
        const result = cli.detector.detectLanguage(text);
        cli.displayResult(result);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

// Exportar para uso como módulo
module.exports = { LanguageDetector, LanguageDetectorCLI };