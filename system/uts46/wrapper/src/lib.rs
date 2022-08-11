pub mod wrap;
pub use wrap::*;

pub fn to_ascii(args: ArgsToAscii) -> String {
    return String::from("");
}

pub fn to_unicode(args: ArgsToUnicode) -> String {
    return String::from("");
}

pub fn convert(args: ArgsConvert) -> ConvertResult {
    return ConvertResult {
        i_d_n: String::from(""),
        p_c: String::from(""),
    }
}

