import SwiftUI

extension Color {
    // Header / Dark elements
    static let lunaDark = Color(red: 0.10, green: 0.06, blue: 0.25)        // #1a1040
    static let lunaDarkBorder = Color(red: 0.18, green: 0.12, blue: 0.38)  // #2d1f60
    static let lunaDarkLight = Color(red: 0.24, green: 0.18, blue: 0.44)   // #3d2f70

    // Gold accents
    static let lunaGold = Color(red: 0.83, green: 0.72, blue: 0.44)       // #d4b870
    static let lunaGoldDark = Color(red: 0.79, green: 0.64, blue: 0.34)   // #c9a456

    // Purple backgrounds
    static let lunaBg = Color(red: 0.97, green: 0.96, blue: 1.00)         // #f8f5ff
    static let lunaCard = Color(red: 0.95, green: 0.93, blue: 1.00)       // #f3eeff
    static let lunaBorder = Color(red: 0.89, green: 0.85, blue: 0.95)     // #e2d9f3

    // Text
    static let lunaText = Color(red: 0.10, green: 0.06, blue: 0.25)       // #1a1040
    static let lunaMuted = Color(red: 0.49, green: 0.43, blue: 0.63)      // #7c6ea0
    static let lunaLight = Color(red: 0.72, green: 0.67, blue: 0.83)      // #b8acd4
    static let lunaSubtle = Color(red: 0.56, green: 0.50, blue: 0.75)     // #9080c0
    static let lunaLavender = Color(red: 0.77, green: 0.71, blue: 0.99)   // #c4b5fd
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
    let h = minutes / 60
    let m = minutes % 60
    if h > 0 {
        return "\(h):\(String(format: "%02d", m))"
    }
    return "\(m)分"
}

func exitTime(checkIn: Date, setMinutes: Int) -> String {
    checkIn.addingTimeInterval(TimeInterval(setMinutes * 60)).hhMM
}
