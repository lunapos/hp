import SwiftUI

// MARK: - Adaptive Color Helper

private func adaptive(light: (CGFloat, CGFloat, CGFloat), dark: (CGFloat, CGFloat, CGFloat)) -> Color {
    Color(uiColor: UIColor { traits in
        let (r, g, b) = traits.userInterfaceStyle == .dark ? dark : light
        return UIColor(red: r, green: g, blue: b, alpha: 1)
    })
}

extension Color {
    // Header / Dark elements (same in both modes)
    static let lunaDark = Color(red: 0.10, green: 0.06, blue: 0.25)        // #1a1040
    static let lunaDarkBorder = Color(red: 0.18, green: 0.12, blue: 0.38)  // #2d1f60
    static let lunaDarkLight = Color(red: 0.24, green: 0.18, blue: 0.44)   // #3d2f70

    // Gold accents (same in both modes)
    static let lunaGold = Color(red: 0.83, green: 0.72, blue: 0.44)       // #d4b870
    static let lunaGoldDark = Color(red: 0.79, green: 0.64, blue: 0.34)   // #c9a456

    // Adaptive backgrounds
    static let lunaBg = adaptive(
        light: (0.96, 0.94, 0.90),   // #f5f0e6 — warm ivory
        dark:  (0.10, 0.08, 0.18)    // #1a1430
    )
    static let lunaCard = adaptive(
        light: (1.00, 0.99, 0.96),   // #fffcf5 — warm white
        dark:  (0.20, 0.17, 0.34)    // #332b57
    )
    static let lunaBorder = adaptive(
        light: (0.84, 0.80, 0.72),   // #d6ccb8 — champagne border
        dark:  (0.35, 0.30, 0.52)    // #594d85
    )

    // Adaptive text
    static let lunaText = adaptive(
        light: (0.14, 0.11, 0.08),   // #241c14 — deep warm black
        dark:  (0.94, 0.92, 0.97)    // #f0eaf8
    )
    static let lunaMuted = adaptive(
        light: (0.46, 0.42, 0.35),   // #766b59 — warm grey-brown
        dark:  (0.65, 0.60, 0.78)    // #a699c7
    )
    static let lunaLight = adaptive(
        light: (0.66, 0.62, 0.55),   // #a89e8c — warm light grey
        dark:  (0.52, 0.46, 0.68)    // #8575ad
    )
    static let lunaSubtle = adaptive(
        light: (0.52, 0.48, 0.40),   // #857a66 — warm medium
        dark:  (0.60, 0.54, 0.78)    // #998ac7
    )
    static let lunaLavender = adaptive(
        light: (0.55, 0.45, 0.75),   // #8c73bf — deeper accent purple
        dark:  (0.68, 0.62, 0.92)    // #ad9eeb
    )
}

// Allow .lunaXxx in foregroundStyle() which requires ShapeStyle
extension ShapeStyle where Self == Color {
    static var lunaDark: Color { Color.lunaDark }
    static var lunaDarkBorder: Color { Color.lunaDarkBorder }
    static var lunaDarkLight: Color { Color.lunaDarkLight }
    static var lunaGold: Color { Color.lunaGold }
    static var lunaGoldDark: Color { Color.lunaGoldDark }
    static var lunaBg: Color { Color.lunaBg }
    static var lunaCard: Color { Color.lunaCard }
    static var lunaBorder: Color { Color.lunaBorder }
    static var lunaText: Color { Color.lunaText }
    static var lunaMuted: Color { Color.lunaMuted }
    static var lunaLight: Color { Color.lunaLight }
    static var lunaSubtle: Color { Color.lunaSubtle }
    static var lunaLavender: Color { Color.lunaLavender }
}

extension Int {
    var yenFormatted: String {
        "¥\(formatted(.number))"
    }
}

extension Date {
    var hhMM: String {
        formatted(Date.FormatStyle().hour(.twoDigits(amPM: .omitted)).minute(.twoDigits))
    }

    var hhMMss: String {
        formatted(Date.FormatStyle().hour(.twoDigits(amPM: .omitted)).minute(.twoDigits).second(.twoDigits))
    }

    func elapsedMinutes(from start: Date = Date()) -> Int {
        Int(start.timeIntervalSince(self) / 60)
    }
}

func formatElapsed(_ minutes: Int) -> String {
    "\(minutes)分"
}

func exitTime(checkIn: Date, setMinutes: Int) -> String {
    checkIn.addingTimeInterval(TimeInterval(setMinutes * 60)).hhMM
}
