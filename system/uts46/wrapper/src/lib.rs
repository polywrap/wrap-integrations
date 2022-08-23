pub mod wrap;
pub use wrap::*;
use unic_idna;
use regex::Regex;

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
        (unicode, Err(_e)) => UnicodeResult { value: unicode, with_error: true },
    }
}

pub fn convert(args: ArgsConvert) -> ConvertResult {
    // determine whether transitional processing is necessary
    let re = Regex::new(r"\.(?:be|ca|de|fr|pm|re|swiss|tf|wf|yt)\.?$").unwrap();
    let pc_flags = unic_idna::Flags {
        use_std3_ascii_rules: false,
        transitional_processing: re.is_match(&args.value),
        verify_dns_length: false
    };

    // get pc result
    let p_c_result = unic_idna::to_ascii(&args.value, pc_flags);
    if p_c_result.is_err() {
        return ConvertResult {
            i_d_n: args.value.clone(),
            p_c: args.value
        };
    }
    let p_c: String = p_c_result.unwrap();

    // get idn result
    let idn_flags = unic_idna::Flags {
        use_std3_ascii_rules: false,
        transitional_processing: false,
        verify_dns_length: false
    };
    let (i_d_n, _) = unic_idna::to_unicode(&args.value, idn_flags);

    ConvertResult { i_d_n, p_c }
}
