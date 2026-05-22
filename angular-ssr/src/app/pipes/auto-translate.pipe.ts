/**
 * @file: src/app/pipes/auto-translate.pipe.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Pipe que traduce textos automáticamente usando MyMemory.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Observable, of, concat } from 'rxjs';
import { map, catchError, switchMap, distinctUntilChanged, delay } from 'rxjs/operators';

/**
 * Lista de correos para rotar cuando se agote la cuota de MyMemory (50k caracteres/correo)
 * @ignore
 */
const EMAILS_FALLBACK = [
    'alvarokilor@gmail.com',
    'minialmucero@gmail.com',
    'alvarogoku666@gmail.com'
];

/**
 * Pipe que traduce textos automáticamente utilizando la API de MyMemory.
 * Detecta automáticamente el idioma de origen y lo traduce al idioma actual seleccionado.
 */
@Pipe({
    name: 'autoTranslate',
    standalone: true,
    pure: true
})
export class AutoTranslatePipe implements PipeTransform {
    /** Caché local para evitar traducir el mismo texto al mismo idioma múltiples veces */
    private cache: { [key: string]: string } = {};
    /** Índice actual del correo en uso para la cuota de la API */
    private currentEmailIndex = 0;

    /**
     * Constructor del AutoTranslatePipe.
     * @param http Cliente HTTP para realizar las peticiones a la API.
     * @param translate Servicio de ngx-translate para detectar el idioma actual.
     */
    constructor(
        private http: HttpClient,
        private translate: TranslateService
    ) { }

    /**
     * Transforma texto autodetectando su idioma y traduciéndolo al idioma actual.
     * Reacciona a cambios de idioma en tiempo real y emite null durante la carga.
     * @param text Texto a traducir procedente de la API.
     * @returns Observable con el texto traducido o null si está en proceso de traducción.
     */
    transform(text: string | null | undefined): Observable<string | null> {
        if (!text) return of('');

        return concat(
            of({ lang: this.translate.currentLang || this.translate.getDefaultLang() || 'es' }),
            this.translate.onLangChange
        ).pipe(
            map((event: any) => (event as LangChangeEvent).lang || (event as any).lang),
            distinctUntilChanged(),
            switchMap(lang => this.translateText(text, lang)),
            catchError(() => of(text))
        );
    }

    /**
     * Gestiona la lógica de decisión de traducción, caché e idiomas ignorados.
     * @param text Texto base a traducir.
     * @param targetLang Idioma al que se desea traducir.
     * @returns Observable con el resultado procesado o null mientras carga.
     */
    private translateText(text: string, targetLang: string): Observable<string | null> {
        if (targetLang === 'es') {
            return concat(
                of(null),
                of(text).pipe(delay(700))
            );
        }

        const cacheKey = `${targetLang}:${text}`;
        if (this.cache[cacheKey]) {
            return of(this.cache[cacheKey]);
        }

        return concat(
            of(null),
            this.intentarTraduccion(text, targetLang, cacheKey)
        );
    }

    /**
     * Realiza la petición HTTP a MyMemory gestionando la rotación de correos si se agota la cuota.
     * Añade un aviso en naranja si se agotan todos los correos.
     * @param text Texto base a traducir.
     * @param targetLang Idioma de destino.
     * @param cacheKey Clave para guardar el resultado en la caché.
     * @returns Observable con el texto traducido.
     */
    private intentarTraduccion(text: string, targetLang: string, cacheKey: string): Observable<string> {
        const email = EMAILS_FALLBACK[this.currentEmailIndex];
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=Autodetect|${targetLang}&de=${email}`;

        return this.http.get<any>(url).pipe(
            map(res => {
                if (res?.responseStatus === 403 || res?.responseStatus === 429 || res?.responseData?.translatedText?.includes('MYMEMORY WARNING')) {
                    throw new Error('QUOTA_EXCEEDED');
                }

                const translated = res?.responseData?.translatedText || text;
                this.cache[cacheKey] = translated;
                return translated;
            }),
            catchError((error) => {
                if (error.message === 'QUOTA_EXCEEDED') {
                    if (this.currentEmailIndex < EMAILS_FALLBACK.length - 1) {
                        this.currentEmailIndex++;
                        return this.intentarTraduccion(text, targetLang, cacheKey);
                    } else {
                        const warningMsg = this.translate.instant('product.translationLimitReached');
                        const fallbackWithWarning = `<span class="text-orange-500 font-semibold block mb-3">⚠️ ${warningMsg}</span>${text}`;
                        this.cache[cacheKey] = fallbackWithWarning;
                        return of(fallbackWithWarning);
                    }
                }

                return of(text);
            })
        );
    }
}