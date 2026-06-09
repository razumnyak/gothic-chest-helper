(function () {
    const SUPPORTED_LANGUAGES = ["en", "ru", "de", "pl"];
    const DEFAULT_LANGUAGE = "en";
    const COOKIE_NAME = "gothic_lock_lang";

    window.translation = {
        en: {
            app_title: "Lockpicking Solver",
            app_subtitle: "Configure the lock and calculate a solution",
            meta_title:
                "Lockpicking Solver Calculator | Gothic 1 Remake (fun-made)",
            meta_description:
                "Interactive plate lockpicking solver calculator with preset codes, shift effects, solution steps, and animated playback.",
            mode_initial: "Initial Layout",
            mode_shifts: "Shift Effects",
            mode_preview: "Preview",
            templates: "Templates",
            presets: "Presets",
            code: "Code",
            apply: "Apply",
            copy: "Copy",
            share: "Share",
            reset: "Reset",
            plate_count: "Plate Count",
            initial_positions: "Initial Positions",
            initial_help:
                "Left-click a plate in the center to move it left. Right-click to move it right. The target is position 4.",
            initial_info_text:
                "Set the initial plate positions in the left panel. When the layout matches known presets, Suggested Shift Effects can offer matching variants for that starting setup.",
            initial_info_note:
                "Note: all presets are intended for characters without upgraded lockpicking skills.",
            active_plate: "Active Plate",
            visual_reference: "Show shifts relative to",
            visual_reference_initial: "Initial Layout",
            visual_reference_base: "Base Position (4)",
            plate_reactions: "Plate Reactions",
            effects_help:
                "Select the active plate, then click plates in the center to cycle their reaction: 0 -> +1 -> -1. The active plate is fixed at +1. This defines how plates react when the active plate moves right. Moving left uses the inverse effect.",
            demo_playback: "Demo Playback",
            start_control: "Start",
            prev: "Prev",
            play: "Play",
            pause: "Pause",
            next: "Next",
            playback_speed: "Speed mode",
            preview_help:
                "Calculate a solution, then step through it here. Initial Layout and Shift Effects stay unchanged.",
            lock_mechanism: "Lock Mechanism",
            before_move: "Before Move",
            after_move: "After Move",
            wasd_title: "WASD Transcription (<i>Experimental</i>)",
            wasd_title_count:
                "WASD Transcription [{count}] (<i>Experimental</i>)",
            wasd_empty: "Calculate a solution to show controls.",
            solution: "Solution",
            search_algorithm: "Search Algorithm (Experimental)",
            algo_wasd: "1. Fewer WASD keys [default]",
            algo_plate_travel: "2. Less plate travel",
            algo_switches: "3. Fewer switches (fast heuristic)",
            algo_bfs: "4. BFS shortest",
            auto: "auto",
            auto_title: "Auto-select best algorithm (fewest WASD keypresses)",
            calculate: "Calculate",
            waiting_setup: "Waiting for setup",
            algorithm_faq:
                "BFS is usually the fastest by performance, but it optimizes move count rather than WASD keypresses. Fewer WASD keys is the default because it is usually more practical for manual input.",
            algorithm_faq_auto:
                "Auto mode runs all algorithms and selects the shortest result by total WASD keypresses for solving the puzzle.",
            footer_github: "GitHub:",
            footer_steam: "Steam guide",
            footer_note:
                "We accept issues/comments with presets. Please include the preset code and a short explanation of the setup or expected behavior.",
            language: "Language",
            reset_title: "Reset setup?",
            reset_text:
                "Reset clears the current Initial Layout and Shift Effects, then returns the lock to the default custom setup.",
            cancel: "Cancel",
            custom: "Custom",
            suggested_shift_effects: "Suggested Shift Effects",
            no_suggestions:
                "No matching presets for this initial layout yet.",
            shift_applied: "Shift effects applied: {name}",
            calculate_to_solve: "Calculate to solve",
            effect_reverse: "reverse",
            effect_same: "same",
            effect_none: "none",
            effect_moves_left: "moves left when this plate moves right",
            effect_moves_right: "moves right when this plate moves right",
            effect_no_move: "does not move",
            active_plate_always: "Active plate always moves right",
            click_cycle_effect: "Click to cycle: 0, +1, -1",
            template_too_short: "Template code is too short",
            invalid_plate_count: "Invalid plate count",
            invalid_initial_layout: "Invalid initial layout",
            invalid_shift_effects: "Invalid shift effects",
            template_extra_characters: "Template code has extra characters",
            invalid_template_character: "Invalid template character: {char}",
            effect_preview: "Effect preview P{plate}R",
            no_movement_required: "No movement required.",
            start: "Start",
            step: "Step {number}",
            unable_calculate: "Unable to calculate",
            no_solution: "No solution found",
            check_shift_effects: "Check the shift effects",
            already_open: "The lock is already open",
            all_target: "All plates are at position 4",
            solution_found: "Solution found [{count}]",
            solution_found_auto: "Solution found [{count}] (auto-best)",
            evaluating_algorithms: "Evaluating algorithms...",
            evaluating_text:
                "Running all modes to find the one with fewest WASD presses.",
            checking_algorithms: "Checking algorithms",
            best_search: "Best search {step}/{total}: {label}",
            checking_algo: "Checking {label} ({step}/{total}).",
            no_solution_any: "No solution found by any algorithm",
            calculating: "Calculating...",
            please_wait: "Please wait",
            progress_starting: "Starting",
            progress_running: "Running {label}",
            progress_done: "Done {label}",
            progress_complete: "Complete",
            solver_unavailable:
                "Solver worker is unavailable. Use GitHub Pages or a local web server.",
            solver_failed:
                "Solver worker failed. Use GitHub Pages or a local web server.",
            generic_solver_failed: "Solver failed",
        },
        ru: {
            app_title: "Калькулятор взлома замков",
            app_subtitle: "Настройте замок и рассчитайте решение",
            meta_title:
                "Калькулятор взлома замков | Gothic 1 Remake (fan-made)",
            meta_description:
                "Интерактивный калькулятор пластинчатых замков с кодами пресетов, эффектами сдвига, шагами решения и анимацией.",
            mode_initial: "Initial Layout",
            mode_shifts: "Shift Effects",
            mode_preview: "Preview",
            templates: "Шаблоны",
            presets: "Пресеты",
            code: "Код",
            apply: "Применить",
            copy: "Копировать",
            share: "Поделиться",
            reset: "Сброс",
            plate_count: "Кол-во пластин",
            initial_positions: "Начальные позиции",
            initial_help:
                "ЛКМ по пластине в центре двигает ее влево. ПКМ двигает вправо. Цель - позиция 4.",
            initial_info_text:
                "Настройте начальное расположение пластин в левом сайдбаре. Если расположение совпадает с известными пресетами, Suggested Shift Effects предложит подходящие варианты для этой начальной настройки.",
            initial_info_note:
                "Примечание: все пресеты рассчитаны на персонажей без прокачанных навыков взлома.",
            active_plate: "Активная пластина",
            visual_reference: "Показывать сдвиги относительно",
            visual_reference_initial: "Initial Layout",
            visual_reference_base: "Base Position (4)",
            plate_reactions: "Реакции пластин",
            effects_help:
                "Выберите активную пластину, затем кликайте по пластинам в центре, чтобы переключать реакцию: 0 -> +1 -> -1. Активная пластина всегда +1. Это задает реакцию пластин при движении активной пластины вправо. Движение влево использует обратный эффект.",
            demo_playback: "Просмотр решения",
            start_control: "Start",
            prev: "Назад",
            play: "Play",
            pause: "Пауза",
            next: "Вперед",
            playback_speed: "Режим скорости",
            preview_help:
                "Рассчитайте решение и просматривайте его шаги здесь. Initial Layout и Shift Effects не изменяются.",
            lock_mechanism: "Механизм замка",
            before_move: "До хода",
            after_move: "После хода",
            wasd_title: "WASD транскрипция (<i>экспериментально</i>)",
            wasd_title_count:
                "WASD транскрипция [{count}] (<i>экспериментально</i>)",
            wasd_empty: "Рассчитайте решение, чтобы увидеть управление.",
            solution: "Решение",
            search_algorithm: "Алгоритм поиска (экспериментально)",
            algo_wasd: "1. Fewer WASD keys [default]",
            algo_plate_travel: "2. Less plate travel",
            algo_switches: "3. Fewer switches (fast heuristic)",
            algo_bfs: "4. BFS shortest",
            auto: "auto",
            auto_title:
                "Автоматически выбрать лучший алгоритм (минимум WASD нажатий)",
            calculate: "Рассчитать",
            waiting_setup: "Ожидание настроек",
            algorithm_faq:
                "BFS обычно самый быстрый по производительности, но он оптимизирует количество ходов, а не число WASD-нажатий. Fewer WASD keys выбран по умолчанию, потому что обычно практичнее для ручного ввода.",
            algorithm_faq_auto:
                "Авто-режим запускает все алгоритмы и выбирает самый короткий вариант по общему количеству WASD-нажатий для решения пазла.",
            footer_github: "GitHub:",
            footer_steam: "Steam guide",
            footer_note:
                "Мы принимаем issues/comments с пресетами. Укажите код пресета и короткое описание настройки или ожидаемого поведения.",
            language: "Язык",
            reset_title: "Сбросить настройку?",
            reset_text:
                "Reset сбрасывает текущие Initial Layout и Shift Effects, затем возвращает замок к стандартной пользовательской настройке.",
            cancel: "Отмена",
            custom: "Custom",
            suggested_shift_effects: "Suggested Shift Effects",
            no_suggestions:
                "Для этого начального расположения пока нет совпадающих пресетов.",
            shift_applied: "Shift effects применены: {name}",
            calculate_to_solve: "Рассчитайте решение",
            effect_reverse: "reverse",
            effect_same: "same",
            effect_none: "none",
            effect_moves_left: "двигается влево при движении активной вправо",
            effect_moves_right: "двигается вправо при движении активной вправо",
            effect_no_move: "не двигается",
            active_plate_always: "Активная пластина всегда движется вправо",
            click_cycle_effect: "Клик переключает: 0, +1, -1",
            template_too_short: "Код шаблона слишком короткий",
            invalid_plate_count: "Некорректное количество пластин",
            invalid_initial_layout: "Некорректный Initial Layout",
            invalid_shift_effects: "Некорректные Shift Effects",
            template_extra_characters: "В коде шаблона есть лишние символы",
            invalid_template_character: "Некорректный символ шаблона: {char}",
            effect_preview: "Превью эффекта P{plate}R",
            no_movement_required: "Движение не требуется.",
            start: "Старт",
            step: "Шаг {number}",
            unable_calculate: "Не удалось рассчитать",
            no_solution: "Решение не найдено",
            check_shift_effects: "Проверьте Shift Effects",
            already_open: "Замок уже открыт",
            all_target: "Все пластины на позиции 4",
            solution_found: "Решение найдено [{count}]",
            solution_found_auto: "Решение найдено [{count}] (auto-best)",
            evaluating_algorithms: "Оценка алгоритмов...",
            evaluating_text:
                "Запускаем все режимы, чтобы найти вариант с минимальным числом WASD нажатий.",
            checking_algorithms: "Проверка алгоритмов",
            best_search: "Best search {step}/{total}: {label}",
            checking_algo: "Проверка {label} ({step}/{total}).",
            no_solution_any: "Ни один алгоритм не нашел решение",
            calculating: "Расчет...",
            please_wait: "Пожалуйста, подождите",
            progress_starting: "Starting",
            progress_running: "Running {label}",
            progress_done: "Done {label}",
            progress_complete: "Complete",
            solver_unavailable:
                "Solver worker недоступен. Используйте GitHub Pages или локальный web server.",
            solver_failed:
                "Solver worker завершился с ошибкой. Используйте GitHub Pages или локальный web server.",
            generic_solver_failed: "Solver failed",
        },
        de: {
            app_title: "Schlossknacken Solver",
            app_subtitle: "Schloss konfigurieren und eine Lösung berechnen",
            meta_title:
                "Schlossknacken Solver Rechner | Gothic 1 Remake (fan-made)",
            meta_description:
                "Interaktiver Rechner für Plattenschlösser mit Preset-Codes, Verschiebeeffekten, Lösungsschritten und animierter Wiedergabe.",
            mode_initial: "Initial Layout",
            mode_shifts: "Shift Effects",
            mode_preview: "Preview",
            templates: "Vorlagen",
            presets: "Presets",
            code: "Code",
            apply: "Anwenden",
            copy: "Kopieren",
            share: "Teilen",
            reset: "Zurücksetzen",
            plate_count: "Plattenanzahl",
            initial_positions: "Startpositionen",
            initial_help:
                "Linksklick auf eine Platte in der Mitte bewegt sie nach links. Rechtsklick bewegt sie nach rechts. Ziel ist Position 4.",
            initial_info_text:
                "Lege die Startpositionen der Platten im linken Seitenbereich fest. Wenn das Layout bekannten Presets entspricht, kann Suggested Shift Effects passende Varianten für dieses Startsetup anbieten.",
            initial_info_note:
                "Hinweis: Alle Presets sind für Charaktere ohne verbesserte Schlossknacken-Fähigkeiten gedacht.",
            active_plate: "Aktive Platte",
            visual_reference: "Verschiebungen relativ anzeigen zu",
            visual_reference_initial: "Initial Layout",
            visual_reference_base: "Base Position (4)",
            plate_reactions: "Plattenreaktionen",
            effects_help:
                "Wähle die aktive Platte und klicke dann Platten in der Mitte, um ihre Reaktion umzuschalten: 0 -> +1 -> -1. Die aktive Platte ist fest auf +1. Das definiert, wie Platten reagieren, wenn die aktive Platte nach rechts geht. Linksbewegung nutzt den inversen Effekt.",
            demo_playback: "Demo-Wiedergabe",
            start_control: "Start",
            prev: "Zurück",
            play: "Play",
            pause: "Pause",
            next: "Weiter",
            playback_speed: "Geschwindigkeitsmodus",
            preview_help:
                "Berechne eine Lösung und gehe sie hier Schritt für Schritt durch. Initial Layout und Shift Effects bleiben unverändert.",
            lock_mechanism: "Schlossmechanik",
            before_move: "Vor dem Zug",
            after_move: "Nach dem Zug",
            wasd_title: "WASD Transkription (<i>experimentell</i>)",
            wasd_title_count:
                "WASD Transkription [{count}] (<i>experimentell</i>)",
            wasd_empty: "Berechne eine Lösung, um die Steuerung zu sehen.",
            solution: "Lösung",
            search_algorithm: "Suchalgorithmus (experimentell)",
            algo_wasd: "1. Fewer WASD keys [default]",
            algo_plate_travel: "2. Less plate travel",
            algo_switches: "3. Fewer switches (fast heuristic)",
            algo_bfs: "4. BFS shortest",
            auto: "auto",
            auto_title:
                "Besten Algorithmus automatisch wählen (wenigste WASD-Tasten)",
            calculate: "Berechnen",
            waiting_setup: "Warte auf Setup",
            algorithm_faq:
                "BFS ist meist am schnellsten bei der Performance, optimiert aber die Zuganzahl und nicht die WASD-Tasten. Fewer WASD keys ist Standard, weil es für manuelle Eingabe meist praktischer ist.",
            algorithm_faq_auto:
                "Der Auto-Modus führt alle Algorithmen aus und wählt das kürzeste Ergebnis nach der Gesamtzahl der WASD-Tasten für das Lösen des Rätsels.",
            footer_github: "GitHub:",
            footer_steam: "Steam guide",
            footer_note:
                "Wir nehmen Issues/Kommentare mit Presets an. Bitte Preset-Code und eine kurze Beschreibung des Setups oder erwarteten Verhaltens angeben.",
            language: "Sprache",
            reset_title: "Setup zurücksetzen?",
            reset_text:
                "Reset löscht das aktuelle Initial Layout und die Shift Effects und setzt das Schloss auf das Standard-Custom-Setup zurück.",
            cancel: "Abbrechen",
            custom: "Custom",
            suggested_shift_effects: "Suggested Shift Effects",
            no_suggestions:
                "Für dieses Startlayout gibt es noch keine passenden Presets.",
            shift_applied: "Shift effects angewendet: {name}",
            calculate_to_solve: "Berechnen zum Lösen",
            effect_reverse: "reverse",
            effect_same: "same",
            effect_none: "none",
            effect_moves_left:
                "bewegt sich nach links, wenn diese Platte nach rechts geht",
            effect_moves_right:
                "bewegt sich nach rechts, wenn diese Platte nach rechts geht",
            effect_no_move: "bewegt sich nicht",
            active_plate_always: "Aktive Platte bewegt sich immer nach rechts",
            click_cycle_effect: "Klicken zum Umschalten: 0, +1, -1",
            template_too_short: "Vorlagencode ist zu kurz",
            invalid_plate_count: "Ungültige Plattenanzahl",
            invalid_initial_layout: "Ungültiges Initial Layout",
            invalid_shift_effects: "Ungültige Shift Effects",
            template_extra_characters:
                "Vorlagencode enthält zusätzliche Zeichen",
            invalid_template_character: "Ungültiges Vorlagenzeichen: {char}",
            effect_preview: "Effektvorschau P{plate}R",
            no_movement_required: "Keine Bewegung erforderlich.",
            start: "Start",
            step: "Schritt {number}",
            unable_calculate: "Berechnung nicht möglich",
            no_solution: "Keine Lösung gefunden",
            check_shift_effects: "Shift Effects prüfen",
            already_open: "Das Schloss ist bereits offen",
            all_target: "Alle Platten sind auf Position 4",
            solution_found: "Lösung gefunden [{count}]",
            solution_found_auto: "Lösung gefunden [{count}] (auto-best)",
            evaluating_algorithms: "Algorithmen werden geprüft...",
            evaluating_text:
                "Alle Modi laufen, um die Variante mit den wenigsten WASD-Tasten zu finden.",
            checking_algorithms: "Algorithmen prüfen",
            best_search: "Best search {step}/{total}: {label}",
            checking_algo: "Prüfe {label} ({step}/{total}).",
            no_solution_any: "Kein Algorithmus hat eine Lösung gefunden",
            calculating: "Berechnung...",
            please_wait: "Bitte warten",
            progress_starting: "Starting",
            progress_running: "Running {label}",
            progress_done: "Done {label}",
            progress_complete: "Complete",
            solver_unavailable:
                "Solver worker ist nicht verfügbar. Nutze GitHub Pages oder einen lokalen Webserver.",
            solver_failed:
                "Solver worker ist fehlgeschlagen. Nutze GitHub Pages oder einen lokalen Webserver.",
            generic_solver_failed: "Solver failed",
        },
        pl: {
            app_title: "Kalkulator otwierania zamków",
            app_subtitle: "Skonfiguruj zamek i oblicz rozwiązanie",
            meta_title:
                "Kalkulator otwierania zamków | Gothic 1 Remake (fan-made)",
            meta_description:
                "Interaktywny kalkulator zamków płytkowych z kodami presetów, efektami przesunięcia, krokami rozwiązania i animacją.",
            mode_initial: "Initial Layout",
            mode_shifts: "Shift Effects",
            mode_preview: "Preview",
            templates: "Szablony",
            presets: "Presety",
            code: "Kod",
            apply: "Zastosuj",
            copy: "Kopiuj",
            share: "Udostępnij",
            reset: "Reset",
            plate_count: "Liczba płytek",
            initial_positions: "Pozycje początkowe",
            initial_help:
                "Kliknij lewym przyciskiem płytkę w centrum, aby przesunąć ją w lewo. Prawy klik przesuwa w prawo. Celem jest pozycja 4.",
            initial_info_text:
                "Ustaw początkowe pozycje płytek w lewym panelu. Jeśli układ pasuje do znanych presetów, Suggested Shift Effects może zaproponować pasujące warianty dla tego ustawienia początkowego.",
            initial_info_note:
                "Uwaga: wszystkie presety są przeznaczone dla postaci bez rozwiniętych umiejętności otwierania zamków.",
            active_plate: "Aktywna płytka",
            visual_reference: "Pokaż przesunięcia względem",
            visual_reference_initial: "Initial Layout",
            visual_reference_base: "Base Position (4)",
            plate_reactions: "Reakcje płytek",
            effects_help:
                "Wybierz aktywną płytkę, a potem klikaj płytki w centrum, aby zmieniać ich reakcję: 0 -> +1 -> -1. Aktywna płytka jest zawsze +1. To określa reakcję płytek, gdy aktywna płytka idzie w prawo. Ruch w lewo używa efektu odwrotnego.",
            demo_playback: "Podgląd rozwiązania",
            start_control: "Start",
            prev: "Wstecz",
            play: "Play",
            pause: "Pauza",
            next: "Dalej",
            playback_speed: "Tryb szybkości",
            preview_help:
                "Oblicz rozwiązanie, a potem przechodź przez nie tutaj. Initial Layout i Shift Effects pozostają bez zmian.",
            lock_mechanism: "Mechanizm zamka",
            before_move: "Przed ruchem",
            after_move: "Po ruchu",
            wasd_title: "Transkrypcja WASD (<i>eksperymentalne</i>)",
            wasd_title_count:
                "Transkrypcja WASD [{count}] (<i>eksperymentalne</i>)",
            wasd_empty: "Oblicz rozwiązanie, aby pokazać sterowanie.",
            solution: "Rozwiązanie",
            search_algorithm: "Algorytm wyszukiwania (eksperymentalny)",
            algo_wasd: "1. Fewer WASD keys [default]",
            algo_plate_travel: "2. Less plate travel",
            algo_switches: "3. Fewer switches (fast heuristic)",
            algo_bfs: "4. BFS shortest",
            auto: "auto",
            auto_title:
                "Automatycznie wybierz najlepszy algorytm (najmniej klawiszy WASD)",
            calculate: "Oblicz",
            waiting_setup: "Oczekiwanie na ustawienia",
            algorithm_faq:
                "BFS zwykle jest najszybszy pod względem wydajności, ale optymalizuje liczbę ruchów, a nie liczbę naciśnięć WASD. Fewer WASD keys jest domyślne, bo zwykle jest praktyczniejsze przy ręcznym wpisywaniu.",
            algorithm_faq_auto:
                "Tryb auto uruchamia wszystkie algorytmy i wybiera najkrótszy wynik według całkowitej liczby naciśnięć WASD potrzebnych do rozwiązania zagadki.",
            footer_github: "GitHub:",
            footer_steam: "Steam guide",
            footer_note:
                "Przyjmujemy issues/komentarze z presetami. Dołącz kod presetu i krótki opis ustawienia albo oczekiwanego działania.",
            language: "Język",
            reset_title: "Zresetować ustawienia?",
            reset_text:
                "Reset czyści bieżące Initial Layout i Shift Effects, a potem przywraca zamek do domyślnego ustawienia custom.",
            cancel: "Anuluj",
            custom: "Custom",
            suggested_shift_effects: "Suggested Shift Effects",
            no_suggestions:
                "Nie ma jeszcze pasujących presetów dla tego układu początkowego.",
            shift_applied: "Shift effects zastosowane: {name}",
            calculate_to_solve: "Oblicz, aby rozwiązać",
            effect_reverse: "reverse",
            effect_same: "same",
            effect_none: "none",
            effect_moves_left:
                "przesuwa się w lewo, gdy ta płytka idzie w prawo",
            effect_moves_right:
                "przesuwa się w prawo, gdy ta płytka idzie w prawo",
            effect_no_move: "nie przesuwa się",
            active_plate_always: "Aktywna płytka zawsze przesuwa się w prawo",
            click_cycle_effect: "Kliknij, aby zmienić: 0, +1, -1",
            template_too_short: "Kod szablonu jest zbyt krótki",
            invalid_plate_count: "Nieprawidłowa liczba płytek",
            invalid_initial_layout: "Nieprawidłowy Initial Layout",
            invalid_shift_effects: "Nieprawidłowe Shift Effects",
            template_extra_characters: "Kod szablonu ma dodatkowe znaki",
            invalid_template_character: "Nieprawidłowy znak szablonu: {char}",
            effect_preview: "Podgląd efektu P{plate}R",
            no_movement_required: "Ruch nie jest wymagany.",
            start: "Start",
            step: "Krok {number}",
            unable_calculate: "Nie można obliczyć",
            no_solution: "Nie znaleziono rozwiązania",
            check_shift_effects: "Sprawdź Shift Effects",
            already_open: "Zamek jest już otwarty",
            all_target: "Wszystkie płytki są na pozycji 4",
            solution_found: "Znaleziono rozwiązanie [{count}]",
            solution_found_auto: "Znaleziono rozwiązanie [{count}] (auto-best)",
            evaluating_algorithms: "Sprawdzanie algorytmów...",
            evaluating_text:
                "Uruchamiamy wszystkie tryby, aby znaleźć wariant z najmniejszą liczbą naciśnięć WASD.",
            checking_algorithms: "Sprawdzanie algorytmów",
            best_search: "Best search {step}/{total}: {label}",
            checking_algo: "Sprawdzanie {label} ({step}/{total}).",
            no_solution_any: "Żaden algorytm nie znalazł rozwiązania",
            calculating: "Obliczanie...",
            please_wait: "Proszę czekać",
            progress_starting: "Starting",
            progress_running: "Running {label}",
            progress_done: "Done {label}",
            progress_complete: "Complete",
            solver_unavailable:
                "Solver worker jest niedostępny. Użyj GitHub Pages albo lokalnego web servera.",
            solver_failed:
                "Solver worker zakończył się błędem. Użyj GitHub Pages albo lokalnego web servera.",
            generic_solver_failed: "Solver failed",
        },
    };

    function normalizeLanguage(value) {
        if (!value) return "";
        const lang = String(value).trim().toLowerCase().split("-")[0];
        return SUPPORTED_LANGUAGES.includes(lang) ? lang : "";
    }

    function getCookieLanguage() {
        const prefix = `${COOKIE_NAME}=`;
        return document.cookie
            .split(";")
            .map((part) => part.trim())
            .find((part) => part.startsWith(prefix))
            ?.slice(prefix.length);
    }

    function getBrowserLanguage() {
        const languages = navigator.languages?.length
            ? navigator.languages
            : [navigator.language];

        for (const language of languages) {
            const normalized = normalizeLanguage(language);
            if (normalized) return normalized;
        }

        return "";
    }

    function resolveInitialLanguage() {
        const params = new URLSearchParams(window.location.search);
        return (
            normalizeLanguage(params.get("lang")) ||
            normalizeLanguage(getCookieLanguage()) ||
            getBrowserLanguage() ||
            DEFAULT_LANGUAGE
        );
    }

    let currentLanguage = resolveInitialLanguage();

    function t(key, vars = {}) {
        const table = window.translation[currentLanguage] || {};
        const fallback = window.translation[DEFAULT_LANGUAGE] || {};
        const template = table[key] ?? fallback[key] ?? key;

        return String(template).replace(/\{(\w+)\}/g, (_, name) => {
            return vars[name] ?? "";
        });
    }

    function applyTranslations() {
        document.documentElement.lang = currentLanguage;
        document.title = t("meta_title");

        const description = document.querySelector('meta[name="description"]');
        if (description) description.content = t("meta_description");

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.content = t("meta_title");

        const ogDescription = document.querySelector(
            'meta[property="og:description"]',
        );
        if (ogDescription) ogDescription.content = t("meta_description");

        const twitterTitle = document.querySelector(
            'meta[name="twitter:title"]',
        );
        if (twitterTitle) twitterTitle.content = t("meta_title");

        const twitterDescription = document.querySelector(
            'meta[name="twitter:description"]',
        );
        if (twitterDescription) twitterDescription.content = t("meta_description");

        document.querySelectorAll("[id^='txt_tr_']").forEach((element) => {
            const key = element.id.slice("txt_tr_".length);
            if (element.dataset.trHtml === "true") {
                element.innerHTML = t(key);
            } else {
                element.textContent = t(key);
            }
        });

        document.querySelectorAll("[data-tr]").forEach((element) => {
            if (element.id?.startsWith("txt_tr_")) return;
            const key = element.dataset.tr;
            if (element.dataset.trHtml === "true") {
                element.innerHTML = t(key);
            } else {
                element.textContent = t(key);
            }
        });

        document.querySelectorAll("[data-tr-title]").forEach((element) => {
            element.title = t(element.dataset.trTitle);
        });

        document
            .querySelectorAll("[data-tr-placeholder]")
            .forEach((element) => {
                element.placeholder = t(element.dataset.trPlaceholder);
            });

        document.querySelectorAll("[data-tr-aria-label]").forEach((element) => {
            element.setAttribute("aria-label", t(element.dataset.trAriaLabel));
        });

        const languageSelect = document.getElementById("languageSelect");
        if (languageSelect) languageSelect.value = currentLanguage;
    }

    function setCookieLanguage(language) {
        document.cookie = `${COOKIE_NAME}=${language};path=/;max-age=31536000;samesite=lax`;
    }

    function setLanguage(language, options = {}) {
        const normalized = normalizeLanguage(language) || DEFAULT_LANGUAGE;
        currentLanguage = normalized;
        setCookieLanguage(normalized);
        applyTranslations();

        if (options.updateUrl !== false) {
            const url = new URL(window.location.href);
            url.searchParams.set("lang", normalized);
            window.history.replaceState(null, "", url.toString());
        }

        window.dispatchEvent(
            new CustomEvent("languagechange", {
                detail: { language: normalized },
            }),
        );
    }

    function init() {
        setCookieLanguage(currentLanguage);
        applyTranslations();
    }

    window.i18n = {
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
        init,
        setLanguage,
        getLanguage: () => currentLanguage,
        applyTranslations,
    };
})();
