use clap::Parser;
use dotenvy;
use glob::glob;
use shellexpand;
use std::{collections::HashSet, env, io::Write, path::Path};
// Get list of <game>...server execs
// Run them all at once, since they take forever
// As they return, regex parse them
// Return results to stdout
#[derive(Parser, Debug)]
// #[command(author, version, about, long_about = None)]
struct Args {
    #[arg(short,long,num_args(0..))]
    paths: Option<Vec<String>>,

    #[arg(short,long,num_args(0..))]
    games: Option<Vec<String>>,

    #[arg(long)]
    root_path: Option<String>,
}

fn main() {
    // format!() doesn't work at compile time,
    // Which makes the following impossible:
    // let root_path_key = "ROOT";
    // let env_default_contents: &str = format!("{}=", root_path_key).as_str();
    // So, instead of adding a crate fixing this, just hardcode it instead
    // These 2 vars should be equal ("=" sign aside)
    let root_path_key = "ROOT";
    let env_default_contents = "ROOT=";

    let env_filename = "./env";
    // Ensure env_filename exists
    if !std::path::Path::new(env_filename).exists() {
        let mut f = std::fs::File::create(env_filename).expect("Couldn't create file");
        f.write_all(env_default_contents.as_bytes())
            .expect("Error writing to newly created config file");
    }

    let args = Args::parse();

    // Update root_path, if applicable
    // TODO: Make env file writing robust, right now there is only one config option (root-path)
    if let Some(root_path) = &args.root_path {
        std::fs::File::create(env_filename)
            .expect("Error when creating/opening file")
            .write(format!("{}{}", env_default_contents, root_path).as_bytes())
            .expect("Couldn't write to env file");
    }

    // Root path should be set at this point //

    dotenvy::from_filename(env_filename).expect("Error reading file");
    let root_path_pretilde = env::var(root_path_key).expect("Error when reading root path");
    let root_path = &*shellexpand::tilde(&root_path_pretilde);

    if root_path.is_empty() {
        println!("Please set a root path via: ./game-server-query --root-path");
        std::process::exit(1);
    }

    let mut path_set: HashSet<String> = HashSet::new();

    add_paths(&args, root_path, &mut path_set);

    add_games(&args, root_path, &mut path_set);

    retrieve_data(&args, &path_set);
}

fn retrieve_data(_args: &Args, path_set: &HashSet<String>) {
    path_set.iter().for_each(|path| {
        let path = std::path::Path::new(path);
        // println!("{:?}", path);

        let server = glob(path.join("*server").to_str().expect("Failed to join paths"))
            .expect("Failed to read glob pattern")
            .filter_map(|entry| {
                if entry.is_ok() {
                    Some(entry.unwrap())
                } else {
                    None
                }
            })
            .find(|entry| {
                if entry.is_file() && entry.to_str().expect("wasn't utf8").ends_with("server") {
                    return true;
                }
                return false;
            });

        if server.is_none() {
            return;
        }

        println!(
            "TODO: re-impl regex of ./*server details: {:?}",
            server.unwrap()
        );
        // let server_executable = read_dir(path).expect("Error when reading dir".find(|entry| {
        //     entry.expect("Error when reading file/dir").file_name().to_str().expect("String wasn't utf8").
        // });
    })
}

fn add_paths(args: &Args, root_path: &str, path_set: &mut HashSet<String>) {
    if let Some(paths) = args.paths.as_ref() {
        for rel_path in paths {
            let split: Vec<_> = rel_path.split("/").collect();
            if split.len() != 2 {
                panic!(
                    "Expected path of the form <game>/<server>, instead got {}",
                    rel_path
                );
            }
            let path = Path::new(root_path)
                .join(rel_path)
                .to_str()
                .expect("String wasn't Unicode")
                .to_owned();
            path_set.insert(path);
        }
    }
}

fn add_games(args: &Args, root_path: &str, path_set: &mut HashSet<String>) {
    let Some(games) = args.games.as_ref() else { return };

    games.into_iter().for_each(|game| {
        if game.find(std::path::MAIN_SEPARATOR_STR).is_some() {
            panic!(
                "Expected game (a string with no slashes), instead got {}",
                game
            );
        };

        let servers = match std::fs::read_dir(std::path::Path::new(&root_path).join(game)) {
            Ok(contents) => contents,
            Err(e) => {
                eprintln!("Error reading directory: {}", e);
                return;
            }
        };

        servers.for_each(|entry| {
            match entry {
                Ok(e) if e.path().is_dir() => {
                    let rel_path = e
                        .path()
                        .components()
                        .last()
                        .expect("Error getting server name")
                        .as_os_str()
                        .to_str()
                        .expect("server name somehow wasn't valid unicode")
                        .to_owned();
                    let path = Path::new(root_path)
                        .join(game)
                        .join(rel_path)
                        .to_str()
                        .expect("String wasn't Unicode")
                        .to_owned();
                    path_set.insert(path);
                }
                Ok(_) => {}
                Err(e) => eprintln!("Error reading directory: {}", e),
            };
        });
    });
}
