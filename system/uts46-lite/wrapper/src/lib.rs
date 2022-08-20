pub mod wrap;
pub use wrap::*;
use unic_idna;

pub fn to_ascii(args: ArgsToAscii) -> String {
    let flags = match args.flags {
        None => unic_idna::Flags {
            use_std3_ascii_rules: false,
            transitional_processing: false,
            verify_dns_length: false
        },
        Some(flags) => unic_idna::Flags {
            use_std3_ascii_rules: flags.use_std3_ascii_rules.unwrap_or_default(),
            transitional_processing: flags.transitional_processing.unwrap_or_default(),
            verify_dns_length: flags.verify_dns_length.unwrap_or_default(),
        },
    };
    match unic_idna::to_ascii(&args.value, flags) {
        Ok(ascii) => ascii,
        Err(e) => panic!("{:?}", e)
    }
}

pub fn to_unicode(args: ArgsToUnicode) -> UnicodeResult {
    let flags = match args.flags {
        None => unic_idna::Flags {
            use_std3_ascii_rules: false,
            transitional_processing: false,
            verify_dns_length: false
        },
        Some(flags) => unic_idna::Flags {
            use_std3_ascii_rules: flags.use_std3_ascii_rules.unwrap_or_default(),
            transitional_processing: flags.transitional_processing.unwrap_or_default(),
            verify_dns_length: flags.verify_dns_length.unwrap_or_default(),
        },
    };
    match unic_idna::to_unicode(&args.value, flags) {
        (unicode, Ok(_)) => UnicodeResult { value: unicode, with_error: false },
        (unicode, Err(e)) => UnicodeResult { value: unicode, with_error: true },
    }
}
